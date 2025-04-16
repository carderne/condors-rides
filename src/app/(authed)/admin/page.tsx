import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdmin } from "@/dal/membership";
import { db, schema } from "@/db";
import { asc } from "drizzle-orm";
import { banUserAction, unbanUserAction } from "./actions";

export default async function AdminPage() {
  await getAdmin();
  const users = await db.query.user.findMany({
    with: { rides: true },
    orderBy: asc(schema.user.name),
  });

  return (
    <div className="w-full rounded-md border">
      <div className="w-full caption-bottom text-sm">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="border-b transition-colors">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rides lead</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50 border-b transition-colors">
                <TableCell>
                  {user.name} {user.deactivatedAt && <span className="text-primary">[BANNED]</span>}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.type}</TableCell>
                <TableCell>{user.rides.length}</TableCell>
                <TableCell>
                  {user.deactivatedAt ? (
                    <Button size="sm" onClick={unbanUserAction.bind(null, user.id)}>
                      Unban
                    </Button>
                  ) : user.type !== "admin" ? (
                    <Button size="sm" onClick={banUserAction.bind(null, user.id)}>
                      Ban
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
