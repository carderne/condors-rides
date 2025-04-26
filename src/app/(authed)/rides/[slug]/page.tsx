import { Confirmation } from "@/components/confirmation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { checkIsAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  BikeIcon,
  CalendarIcon,
  ClockIcon,
  CoffeeIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
  HandHelpingIcon,
  MapPinIcon,
  MountainIcon,
  RecycleIcon,
  RouteIcon,
  Trash2Icon,
  UsersIcon,
  WindIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cancelRideAction,
  claimRideAction,
  deleteRideAction,
  joinRideAction,
  leaveRideAction,
  unCancelRideAction,
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
        orderBy: [desc(schema.comment.createdAt), desc(schema.comment.id)],
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
  const isCanceled = !!ride.canceledAt;

  const riders = [...ride.members.map((m) => m.user), ...(unclaimed ? [] : [ride.leader])];

  return (
    <div className="flex flex-col gap-8">
      {/* Ride Header */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="relative bg-gradient-to-r from-pink-500 to-pink-600 p-8 text-white">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">
                <span className={cn(isCanceled ? "line-through" : "")}>{ride.name}</span>
                {isCanceled && <span className="ml-2">CANCELLED</span>}
              </h1>
              <div className="flex items-center gap-3">
                <UserAvatar user={unclaimed ? null : ride.leader} />
                <div className="flex flex-col">
                  {unclaimed ? (
                    <>
                      <span className="font-medium">No leader!</span>
                      <span className="text-sm opacity-90">
                        Hit the Lead button below if you're up to it!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm opacity-90">Led by</span>
                      <span className="font-medium">{ride.leader.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2">
              <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{format(ride.date, "EEE, dd MMM yyyy")}</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <ClockIcon className="h-5 w-5" />
                  <span>{ride.time.slice(0, 5)}</span>
                </div>
              </div>
              {hasJoined ? (
                <Button
                  className="w-full bg-red-100 bg-white py-6 text-lg text-black hover:bg-red-200"
                  disabled={isLeader || isCanceled}
                  onClick={leaveRideAction.bind(null, ride.id)}
                >
                  Leave this ride
                </Button>
              ) : (
                <Button
                  className="w-full bg-white py-6 text-lg text-black hover:bg-pink-200"
                  disabled={isLeader || isCanceled}
                  onClick={joinRideAction.bind(null, ride.id)}
                >
                  Join this ride
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {ride.notes && (
        <div className="w-full text-center text-xl font-medium text-gray-700">
          <p>{ride.notes}</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-8 md:flex-row">
        {/* Left column - Ride details and actions */}
        <div className="flex basis-1/2 flex-col gap-8">
          {/* Ride Details */}
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                    <WindIcon className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <div className="text-xs tracking-wide text-gray-500 uppercase">Speed</div>
                    <div className="font-semibold">{ride.speed} kph</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                    <MapPinIcon className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <div className="text-xs tracking-wide text-gray-500 uppercase">Distance</div>
                    <div className="font-semibold">{ride.distance} km</div>
                  </div>
                </div>

                {ride.elevation && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                      <MountainIcon className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-xs tracking-wide text-gray-500 uppercase">Elevation</div>
                      <div className="font-semibold">{ride.elevation} m</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                    <RouteIcon className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <div className="text-xs tracking-wide text-gray-500 uppercase">Surface</div>
                    <div className="font-semibold">
                      {ride.surface === "gravel" ? "Gravel" : "Road"}
                    </div>
                  </div>
                </div>

                {ride.cafeStop && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                      <CoffeeIcon className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-xs tracking-wide text-gray-500 uppercase">Cafe Stop</div>
                      <div className="text-primary font-semibold">
                        <Link
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ride.cafeStop)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ride.cafeStop}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {ride.maxGroupSize && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                      <UsersIcon className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-xs tracking-wide text-gray-500 uppercase">
                        Max riders
                      </div>
                      <div className="font-semibold">{ride.maxGroupSize}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Button */}
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {(isLeader || isAdmin) && (
                  <Link href={`/manage/${ride.slug}`}>
                    <Button
                      variant="outline"
                      className="flex w-full items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                    >
                      <EditIcon className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                )}
                <Link href={`/manage/from-ride/${ride.slug}`}>
                  <Button
                    variant="outline"
                    className="flex w-full items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-pink-600"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Duplicate
                  </Button>
                </Link>
                {!isLeader && isAdmin && !unclaimed && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-pink-600"
                    onClick={unclaimRideAction.bind(null, ride.id)}
                  >
                    <HandHelpingIcon className="h-4 w-4" />
                    Remove leader
                  </Button>
                )}
                {isLeader ? (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-pink-600"
                    onClick={unclaimRideAction.bind(null, ride.id)}
                  >
                    <HandHelpingIcon className="h-4 w-4" />
                    Unlead
                  </Button>
                ) : unclaimed ? (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-pink-600"
                    onClick={claimRideAction.bind(null, ride.id)}
                  >
                    <BikeIcon className="h-4 w-4" />
                    Lead
                  </Button>
                ) : null}
                {(isLeader || isAdmin) &&
                  (ride.canceledAt ? (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-yellow-600"
                      onClick={unCancelRideAction.bind(null, ride.id)}
                    >
                      <RecycleIcon className="h-4 w-4" />
                      Un-cancel
                    </Button>
                  ) : (
                    <Confirmation
                      title="Cancel?"
                      description="Are you sure you want to cancel this ride?"
                      action={cancelRideAction.bind(null, ride.id)}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-yellow-600"
                      >
                        <XIcon className="h-4 w-4" />
                        Cancel
                      </Button>
                    </Confirmation>
                  ))}
                {isAdmin && (
                  <Confirmation
                    title="Delete?"
                    description="Are you sure you want to DELETE this ride?"
                    action={deleteRideAction.bind(null, ride.id)}
                  >
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-red-600"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Delete
                    </Button>
                  </Confirmation>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Map */}
        <div className="basis-1/2">
          <Card className="relative flex h-[300px] w-full items-center justify-center bg-gray-50 md:h-full">
            {ride.route && (
              <Link
                href={ride.route}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 z-10 flex items-center justify-center gap-2 rounded-xl border-2 border-pink-200 bg-white px-4 py-3 font-medium text-pink-600 transition-colors hover:bg-pink-50"
              >
                View route
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            )}
            <div className="h-full w-full">
              {ride.geojson ? (
                <Map geojson={ride.geojson} osKey={osKey} />
              ) : (
                <div className="m-auto flex h-full w-1/2 flex-col justify-center">
                  <p>Use Strava or MapMyRide if you want your route to show up here :)</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 md:flex-row">
        {/* Riders List */}
        <Card className="w-full basis-1/2 rounded-2xl p-6 shadow-md">
          {riders.length === 0 ? (
            <div className="m-auto flex h-full w-1/2 flex-col justify-center">
              <p>No one on this ride yet :(</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {riders.map((rider) => (
                <div key={rider.id} className="flex items-center gap-3 p-3">
                  <UserAvatar user={rider} />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{rider.name}</span>
                    {rider.id === ride.leader.id && (
                      <span className="flex items-center text-xs text-pink-500">
                        <BikeIcon className="mr-1 h-3 w-3" />
                        Leader
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Comments Section */}
        <Card className="basis-1/2 rounded-2xl p-6 shadow-md">
          <OptimisticProvider items={ride.comments}>
            {/* Comment Input */}
            <div className="mb-4">
              <NewCommentForm rideId={ride.id} user={user} />
            </div>

            {/* Comments List */}
            <CommentsList userId={user.id} isAdmin={isAdmin} />
          </OptimisticProvider>
        </Card>
      </div>
    </div>
  );
}
