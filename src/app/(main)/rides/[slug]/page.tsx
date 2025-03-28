import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/ui/typography";
import { maybeGetMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { formatFullDate, formatTime } from "@/lib/fmt";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Gauge,
  MapPin,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinRideForm } from "./form";

export default async function RidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentUser = await maybeGetMembership();

  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.slug, slug),
    with: { user: true },
  });

  if (!ride) {
    notFound();
  }

  const members = await db
    .select()
    .from(schema.rideMember)
    .where(eq(schema.rideMember.rideId, ride.id));

  const hasJoined = currentUser
    ? members.some((member) => member.userId === currentUser.id)
    : false;

  return (
    <main className="py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 flex items-center text-pink-600 transition-colors hover:text-pink-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all rides
        </Link>
        <H1>{ride.name}</H1>
        <div className="mt-2 flex items-center gap-2 text-gray-600">
          <User className="h-5 w-5" />
          <span className="text-md">Created by {ride.user.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Ride Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatFullDate(ride.date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Start Time</div>
                  <div className="font-medium">{formatTime(ride.time)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Pace</div>
                  <div className="font-medium">{ride.speed} mph</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="text-sm text-gray-500">Route</div>
                  <Link
                    href={ride.route.startsWith("http") ? ride.route : `https://${ride.route}`}
                    className="flex items-center gap-1 font-medium text-pink-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Strava
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Join This Ride</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {hasJoined ? (
              <div className="py-6 text-center">
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
                  <p className="font-medium">You've joined this ride!</p>
                </div>
                <p className="text-gray-600">You've already signed up for this ride.</p>
              </div>
            ) : (
              <JoinRideForm rideId={ride.id} currentUser={currentUser} />
            )}
          </CardContent>
        </Card>

        <Card className="h-fit md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle>Riders</CardTitle>
              <div className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                {members.length} {members.length === 1 ? "rider" : "riders"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {members.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                  >
                    <UserPlus className="h-5 w-5 text-pink-500" />
                    <div>
                      <div className="font-medium">
                        {member.userId ? (
                          <span>{member.name || "Member"}</span>
                        ) : (
                          <span>{member.name}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(member.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <p>No one has joined this ride yet. Be the first!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
