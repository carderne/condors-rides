import { H1 } from "@/components/ui/typography";
import { maybeGetMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { RideCard } from "./card";

export default async function HomePage() {
  const user = await maybeGetMembership();
  const rides = await db.query.ride.findMany({
    with: { user: true },
    orderBy: [schema.ride.date, schema.ride.time],
  });

  return (
    <main className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <H1>Condors Rides</H1>
        {user ? (
          <div className="flex gap-2">
            <Link
              href="/sign-out"
              className="text-primary flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
            >
              Sign out
            </Link>
            <Link
              href="/manage/new"
              className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New ride</span>
            </Link>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors"
          >
            Sign in to add rides
          </Link>
        )}
      </div>

      <div className="grid max-w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rides.length > 0 ? (
          rides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        ) : (
          <div className="col-span-full rounded-lg border border-dashed bg-slate-50 py-12 text-center">
            <p className="text-lg text-slate-600">No rides scheduled yet!</p>
            <p className="mt-2 text-sm text-slate-500">Create a new ride to get started</p>
          </div>
        )}
      </div>
    </main>
  );
}
