import { getStravaRoute } from "@/clients/strava";
import { Confirmation } from "@/components/confirmation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/ui/typography";
import { UserAvatar } from "@/components/user";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import type { Ride } from "@/db/zod";
import { getConfig } from "@/lib/config";
import { formatFullDate, formatTime } from "@/lib/fmt";
import { invariant } from "@/lib/invariant";
import { checkIsAdmin } from "@/lib/permissions";
import polyline from "@mapbox/polyline";
import { and, eq, isNull } from "drizzle-orm";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExternalLinkIcon,
  GaugeIcon,
  GroupIcon,
  MapPinIcon,
  MountainIcon,
  PencilIcon,
  RulerIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cancelRideAction,
  claimRideAction,
  deleteRideAction,
  joinRideAction,
  leaveRideAction,
  unclaimRideAction,
} from "./actions";
import { NewCommentForm } from "./comment/form";
import { OptimisticProvider } from "./comment/optimistic";
import { CommentsList } from "./comment/table";
import { Map } from "./map";

const { osKey } = getConfig();

export default async function RidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getMembership();

  const ride = await db.query.ride.findFirst({
    where: and(eq(schema.ride.slug, slug), isNull(schema.ride.deletedAt)),
    with: {
      leader: true,
      comments: {
        where: isNull(schema.comment.deletedAt),
        with: { user: true, reactions: true },
      },
      members: { with: { user: true } },
    },
  });

  if (!ride) {
    notFound();
  }

  const { unclaimed } = ride;
  const isLeader = !unclaimed && ride.userId === user.id;
  const hasJoined = ride.members.some((member) => member.userId === user.id);
  const isAdmin = checkIsAdmin(user);

  const numRiders = ride.members.length + (unclaimed ? 0 : 1); // the leader
  const riders = [...ride.members.map((m) => m.user), ...(unclaimed ? [] : [ride.leader])];

  const geojson = await getGeojson(ride);

  return (
    <main className="py-8">
      {/* OVERVIEW */}
      <div className="mb-8">
        <Link
          href="/rides"
          className="mb-4 flex items-center text-pink-600 transition-colors hover:text-pink-800"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all rides
        </Link>
        <div className="flex justify-between">
          {ride.canceledAt ? (
            <H1>
              <span className="line-through">{ride.name}</span>{" "}
              <span className="text-primary">CANCELLED</span>
            </H1>
          ) : (
            <H1>{ride.name}</H1>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-gray-600">
          <UserAvatar user={unclaimed ? null : ride.leader} />
          <span className="text-xl font-bold">
            {unclaimed ? "No leader!" : `Leader: ${ride.leader.name}`}
          </span>
        </div>
      </div>

      {/* UNCLAIMED */}
      <div className="flex flex-col gap-8">
        {unclaimed && (
          <Card className="bg-primary/50 h-fit">
            <CardContent className="flex justify-between pt-6">
              <div className="text-lg">
                <p>This ride has no leader and may not go ahead.</p>
                <p>Please hit "Lead this ride" if you'd like to lead it!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ADMIN CARD */}
        {isAdmin && (
          <Card className="h-fit">
            <CardHeader className="bg-gray-700 text-white">
              <CardTitle>Admin controls</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-end pt-6">
              <div className="flex gap-2">
                <Link href={`/manage/${ride.slug}`} className="flex gap-2">
                  <Button variant="secondary">
                    <PencilIcon />
                    Edit (as admin)
                  </Button>
                </Link>
                <Confirmation
                  title="Cancel?"
                  description="Are you sure you want to cancel this ride?"
                  action={cancelRideAction.bind(null, ride.id)}
                >
                  <Button disabled={!!ride.canceledAt} variant="secondary">
                    Cancel (as admin)
                  </Button>
                </Confirmation>
                <Confirmation
                  title="Delete?"
                  description="Are you sure you want to DELETE this ride?"
                  action={deleteRideAction.bind(null, ride.id)}
                >
                  <Button variant="secondary">Delete (as admin)</Button>
                </Confirmation>
              </div>
            </CardContent>
          </Card>
        )}

        {/* JOINING, EDITING */}
        <Card className="h-fit">
          <CardContent className="flex justify-between pt-6">
            {hasJoined ? (
              <Button variant="destructive" onClick={leaveRideAction.bind(null, ride.id)}>
                Leave ride
              </Button>
            ) : !isLeader ? (
              <Button onClick={joinRideAction.bind(null, ride.id)}>Join ride</Button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Link href={`/manage/from-ride/${ride.slug}`}>
                <Button variant="secondary">Do it again!</Button>
              </Link>
              {isLeader && (
                <Link href={`/manage/${ride.slug}`} className="flex gap-2">
                  <Button variant="default">
                    <PencilIcon />
                    Edit
                  </Button>
                </Link>
              )}
              {isLeader ? (
                <Button variant="destructive" onClick={unclaimRideAction.bind(null, ride.id)}>
                  Unlead
                </Button>
              ) : unclaimed ? (
                <Button variant="outline" onClick={claimRideAction.bind(null, ride.id)}>
                  Lead
                </Button>
              ) : null}
              {isLeader && (
                <Confirmation
                  title="Cancel?"
                  description="Are you sure you want to cancel this ride?"
                  action={cancelRideAction.bind(null, ride.id)}
                >
                  <Button disabled={!!ride.canceledAt} variant="destructive">
                    Cancel
                  </Button>
                </Confirmation>
              )}
            </div>
          </CardContent>
        </Card>

        {/* DETAILS */}
        <Card className="h-fit">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Ride Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatFullDate(ride.date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Start Time</div>
                  <div className="font-medium">{formatTime(ride.time)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GaugeIcon className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Speed</div>
                  <div className="font-medium">{ride.speed} kph</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RulerIcon className="text-primary h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Distance</div>
                  <div className="text-sm font-medium">{ride.distance} km</div>
                </div>
              </div>

              {ride.elevation && (
                <div className="flex items-center gap-3">
                  <MountainIcon className="text-primary h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Elevation</div>
                    <div className="text-sm font-medium">{ride.elevation} m</div>
                  </div>
                </div>
              )}

              {ride.route && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-pink-500" />
                  <div>
                    <div className="text-sm text-gray-500">Route</div>
                    <Link
                      href={ride.route.startsWith("http") ? ride.route : `https://${ride.route}`}
                      className="flex items-center gap-1 font-medium text-pink-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View route
                      <ExternalLinkIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {ride.maxGroupSize && (
                <div className="flex items-center gap-3">
                  <GroupIcon className="text-primary h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Max group size</div>
                    <div className="text-sm font-medium">{ride.maxGroupSize}</div>
                  </div>
                </div>
              )}

              {ride.cafeStop && (
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Cafe stop</div>
                    <div className="text-sm font-medium">{ride.cafeStop}</div>
                  </div>
                </div>
              )}

              {ride.notes && (
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Notes</div>
                    <div className="text-sm font-medium">{ride.notes}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MAP */}
        {geojson && (
          <Card className="h-fit">
            <CardContent className="pt-6">
              <div className="h-[600px] w-full">
                <Map geojson={geojson} osKey={osKey} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* RIDERS */}
        <Card className="h-fit md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle>Riders</CardTitle>
              <div className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                {numRiders} {numRiders === 1 ? "rider" : "riders"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-row flex-wrap gap-4">
              {riders.map((user) => (
                <div
                  key={user.id}
                  className="flex basis-1/3 items-center gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <UserAvatar user={user} />
                  <div>
                    <div className="font-medium">
                      <span>{user.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* COMMENT */}
        <Card className="h-fit">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <OptimisticProvider items={ride.comments}>
              <NewCommentForm rideId={ride.id} user={user} />
              <CommentsList userId={user.id} isAdmin={isAdmin} />
            </OptimisticProvider>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

async function getGeojson(ride: Ride): Promise<GeoJSON.LineString | null> {
  if (ride.route && ride.route.includes("strava.com")) {
    const routeId = ride.route.split("/").at(-1);
    invariant(routeId);
    const rrr = await getStravaRoute(routeId);
    const geojson = polyline.toGeoJSON(rrr.map.polyline);
    return geojson;
  }
  return null;
}
