import { RideList } from "@/components/rides/ride-list";
import { H1, H2 } from "@/components/ui/typography";
import { maybeGetMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { gte } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await maybeGetMembership();
  if (user) {
    redirect("/rides");
  }

  const rides = await db.query.ride.findMany({
    where: gte(schema.ride.date, new Date()),
    with: { user: true },
    orderBy: [schema.ride.date, schema.ride.time],
  });

  return (
    <main className="flex flex-col py-8">
      <div className="mb-2 flex flex-col gap-0">
        <H1>Condors Rides</H1>
        <div className="text-xs">(Unofficial!)</div>
      </div>
      <div className="flex justify-between">
        <H2>Upcoming rides</H2>
        <Link
          href="/sign-in"
          className="bg-primary hover:bg-primary-hover ml-auto flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors"
        >
          Sign in to participate
        </Link>
      </div>
      <RideList rides={rides} />
    </main>
  );
}
