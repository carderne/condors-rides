import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { formatFullDate, formatTime } from "@/lib/fmt";
import { eq } from "drizzle-orm";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, Gauge, MapPin, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.slug, slug),
    with: { user: true },
  });

  if (!ride) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-primary hover:text-primary-hover mb-4 flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all rides
        </Link>
        <H1>{ride.name}</H1>
        <div className="mt-2 flex items-center gap-2 text-gray-600">
          <User className="h-5 w-5" />
          Organiser:
          <span className="text-md">{ride.user.name}</span>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card className="h-fit">
          <CardHeader className="from-primary to-primary-hover bg-gradient-to-r text-white">
            <CardTitle>Ride Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-primary h-5 w-5" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatFullDate(ride.date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-primary h-5 w-5" />
                <div>
                  <div className="text-sm text-gray-500">Start Time</div>
                  <div className="font-medium">{formatTime(ride.time)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Gauge className="text-primary h-5 w-5" />
                <div>
                  <div className="text-sm text-gray-500">Pace</div>
                  <div className="font-medium">{ride.speed} mph</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-primary h-5 w-5" />
                <div>
                  <div className="text-sm text-gray-500">Route</div>
                  <Link
                    href={ride.route.startsWith("http") ? ride.route : `https://${ride.route}`}
                    className="text-primary flex items-center gap-1 font-medium hover:underline"
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
      </div>
    </main>
  );
}
