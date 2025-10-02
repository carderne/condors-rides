import { emitRideView } from "@/clients/posthog";
import { Confirmation, Modal } from "@/components/confirmation";
import { Container } from "@/components/container";
import { Map } from "@/components/map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { H2, H3 } from "@/components/ui/typography";
import { UserAvatar } from "@/components/user";
import { getMembership } from "@/dal/membership";
import { viewedRide } from "@/dal/rideView";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { formatShortDateTime, formatStartPoint, isHref } from "@/lib/fmt";
import { checkIsAdmin, rideIsFull } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import {
  BikeIcon,
  CalendarIcon,
  ClockIcon,
  CoffeeIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
  HandHelpingIcon,
  LandPlotIcon,
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
import Markdown from "react-markdown";
import {
  cancelRideAction,
  claimRideAction,
  deleteRideAction,
  joinRideAction,
  leaveRideAction,
  unCancelRideAction,
  unclaimRideAction,
} from "./actions";
import { BackButton } from "./back";
import { NewCommentForm } from "./comment/form";
import { OptimisticProvider } from "./comment/optimistic";
import { CommentsList } from "./comment/table";

const { osKey } = getConfig();

export default async function RidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getMembership();

  const ride = await db.query.ride.findFirst({
    where: and(eq(schema.ride.slug, slug), isNull(schema.ride.deletedAt)),
    with: {
      route: true,
      leader: true,
      changes: true,
      views: {
        where: eq(schema.rideView.userId, user.id),
      },
      comments: {
        where: isNull(schema.comment.deletedAt),
        with: { user: true, reactions: { with: { user: true } } },
        orderBy: [desc(schema.comment.createdAt), desc(schema.comment.id)],
      },
      members: {
        with: { user: true },
        orderBy: [asc(schema.rideMember.createdAt), asc(schema.rideMember.id)],
      },
    },
  });

  if (!ride) {
    notFound();
  }
  await viewedRide(ride.id);
  emitRideView({ user, ride });

  const hasChanged = ride.views.length >= 1 && ride.views[0]!.updatedAt < ride.updatedAt;

  const { unclaimed } = ride;
  const isLeader = !unclaimed && ride.userId === user.id;
  const hasJoined = ride.members.some((member) => member.userId === user.id);
  const isAdmin = checkIsAdmin(user);
  const isCanceled = !!ride.canceledAt;
  const isFull = rideIsFull(ride);
  const isPast = ride.date < addDays(new Date(), -1);

  const riders = [...(unclaimed ? [] : [ride.leader]), ...ride.members.map((m) => m.user)];

  return (
    <div className="flex flex-col gap-8">
      {/* Ride Header */}
      <div
        className={cn(
          "to-primary grow bg-gradient-to-r from-red-400 text-white",
          ride.surface === "gravel" ? "from-amber-700 to-amber-800" : "",
          ride.surface === "virtual" ? "from-purple-700 to-purple-800" : "",
        )}
      >
        <div className="relative flex h-10 items-center justify-end p-2 md:justify-center">
          <BackButton className="absolute left-1" />
          {hasChanged && (
            <div className="animate-bounce px-4 py-2 text-sm">Details have changed!</div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 px-8 pb-4">
          <div className="flex">
            {hasJoined ? (
              <Button
                variant="outline"
                extra="action"
                className="text-foreground aspect-square h-16 text-lg"
                disabled={isLeader || isCanceled || isPast}
                onClick={leaveRideAction.bind(null, ride.id)}
              >
                Leave
              </Button>
            ) : isFull ? (
              <Modal
                title="Ride is full"
                description="Write a comment noting your interest and keep an eye on this page. If someone leaves you can snag a spot. Or maybe someone will duplicate this ride and lead a second group? Maybe you?"
              >
                <Button
                  variant="outline"
                  extra="action"
                  className="text-foreground aspect-square h-16 text-lg"
                  disabled={isLeader || isCanceled || isPast}
                >
                  Full
                </Button>
              </Modal>
            ) : (
              <Button
                variant="outline"
                extra="action"
                className="text-foreground aspect-square h-16 text-lg"
                disabled={isLeader || isCanceled || isPast}
                onClick={joinRideAction.bind(null, ride.id)}
              >
                Join
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span>
              <H2 className={cn("break-all", isCanceled ? "line-through" : "")}>{ride.name}</H2>
              {isCanceled && <span className="ml-2 text-sm">(CANCELLED)</span>}
            </span>
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
          <div>{/* This is just here to force the previous div into the center */}</div>
        </div>
      </div>

      <Container className="pt-0">
        {/* Time and date */}
        <div className="-mt-8 flex justify-center">
          <div className="flex gap-2 overflow-hidden rounded-b-xl border-x-2 border-b-2 border-pink-200 bg-white px-4 py-2 shadow-lg">
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <CalendarIcon className="size-4" />
                <span>{format(ride.date, "EEE, d MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="size-4" />
                <span>{ride.time.slice(0, 5)}</span>
              </div>
            </div>
          </div>
        </div>

        {ride.notes && (
          <div className="[&_a]:decoration-primary/30 [&_a:hover]:bg-primary/30 w-full text-center text-xl font-medium text-gray-700 [&_a]:underline [&_a]:transition-colors [&_a:hover]:no-underline">
            <Markdown>{ride.notes}</Markdown>
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
                      <div className="text-xs tracking-wide text-gray-500 uppercase">
                        Speed on the flat
                      </div>
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

                  {ride.elevation !== null && (
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                        <MountainIcon className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <div className="text-xs tracking-wide text-gray-500 uppercase">
                          Elevation
                        </div>
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
                        {ride.surface === "gravel"
                          ? "Gravel"
                          : ride.surface === "virtual"
                            ? "Virtual"
                            : "Road"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                      <LandPlotIcon className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-xs tracking-wide text-gray-500 uppercase">
                        Start point
                      </div>
                      <div className="text-primary font-semibold">
                        <Link
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ride.startPoint)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formatStartPoint(ride.startPoint)}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {ride.cafeStop !== null && (
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                        <CoffeeIcon className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <div className="text-xs tracking-wide text-gray-500 uppercase">
                          Cafe Stop
                        </div>
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

                  {ride.maxGroupSize !== null && (
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
          </div>

          {/* Right column - Map */}
          <div className="basis-1/2">
            <Card className="relative flex h-[300px] w-full items-center justify-center bg-gray-50 md:h-full">
              {ride.routeUrl && isHref(ride.routeUrl) && (
                <Link
                  href={ride.routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 left-4 z-10 flex items-center justify-center gap-2 rounded-lg border-2 border-pink-200 bg-white px-4 py-3 font-medium text-pink-600 transition-colors hover:bg-pink-50"
                >
                  View route
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              )}
              <div className="h-full w-full">
                {ride.route?.geojson ? (
                  <Map geojson={ride.route.geojson} osKey={osKey} />
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
          <Card className="w-full basis-1/2 p-6">
            {riders.length === 0 ? (
              <div className="m-auto flex h-full w-1/2 flex-col justify-center">
                <p>No one on this ride yet :(</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <H3>
                  Riders {riders.length}
                  {ride.maxGroupSize !== null && `/${ride.maxGroupSize}`}
                </H3>

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
              </div>
            )}
          </Card>

          {/* Comments Section */}
          <Card className="basis-1/2 p-6">
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

        <div className="flex w-full flex-col gap-8 md:flex-row">
          {/* Control panel */}
          <Card className="basis-1/2 overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {(isLeader || isAdmin) && (
                  <Link href={`/manage/${ride.slug}`}>
                    <Button
                      variant="outline"
                      disabled={isPast}
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
                    disabled={isPast}
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-pink-600"
                    onClick={unclaimRideAction.bind(null, ride.id)}
                  >
                    <HandHelpingIcon className="h-4 w-4" />
                    Unlead
                  </Button>
                ) : unclaimed ? (
                  <Button
                    disabled={isPast}
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
                      disabled={isPast}
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

          {/* Changelog */}
          <Card className="w-full basis-1/2 p-6">
            <div className="flex flex-col">
              <H3>Changelog</H3>

              <ul className="list-disc pl-6">
                {ride.changes.map((change) => (
                  <li key={change.id} className="mb-1">
                    {formatShortDateTime(change.createdAt)}: {change.note}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
