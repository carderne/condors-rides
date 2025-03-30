import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { formatFullDate, formatTime } from "@/lib/fmt";
import { eq, isNull } from "drizzle-orm";
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
  UserIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { joinRideAction, leaveRideAction } from "./actions";
import { NewCommentForm } from "./comment/form";
import { OptimisticProvider } from "./comment/optimistic";
import { CommentsList } from "./comment/table";

export default async function RidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getMembership();

  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.slug, slug),
    with: {
      user: true,
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

  const hasJoined = ride.members.some((member) => member.userId === user.id);

  const numRiders = ride.members.length + 1; // the leader
  const riders = [...ride.members.map((m) => m.user), ride.user];

  return (
    <main className="py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 flex items-center text-pink-600 transition-colors hover:text-pink-800"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all rides
        </Link>
        <div className="flex justify-between">
          <H1>{ride.name}</H1>
          {ride.userId === user.id && (
            <Link href={`/manage/${ride.slug}`} className="flex gap-2">
              <Button variant="secondary">
                <PencilIcon />
                Edit
              </Button>
            </Link>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-gray-600">
          <UserIcon className="h-5 w-5" />
          <span className="text-md">Created by {ride.user.name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="h-fit">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Join This Ride</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {hasJoined && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
                <p className="font-medium">You're going!</p>
              </div>
            )}
            {hasJoined ? (
              <Button variant="secondary" onClick={leaveRideAction.bind(null, ride.id)}>
                Leave ride
              </Button>
            ) : (
              <Button onClick={joinRideAction.bind(null, ride.id)}>Join ride</Button>
            )}
          </CardContent>
        </Card>

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
                  <UserPlusIcon className="h-5 w-5 text-pink-500" />
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
        <Card className="h-fit">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <OptimisticProvider items={ride.comments}>
              <NewCommentForm rideId={ride.id} user={user} />
              <CommentsList userId={user.id} />
            </OptimisticProvider>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
