import { Container } from "@/components/container";
import { getAdminUser } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, asc, eq, isNull } from "drizzle-orm";
import { AdminTable } from "./table";

export default async function AdminPage() {
  await getAdminUser();
  const users = await db.query.user.findMany({
    with: {
      ridesJoined: true,
      rides: {
        where: and(
          isNull(schema.ride.canceledAt),
          isNull(schema.ride.deletedAt),
          eq(schema.ride.unclaimed, false),
        ),
      },
    },
    orderBy: asc(schema.user.name),
  });

  return (
    <Container>
      <div className="w-full caption-bottom text-sm">
        <AdminTable users={users} />
      </div>
    </Container>
  );
}
