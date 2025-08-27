import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db } from "@/db";
import { getConfig } from "@/lib/config";
import { RoutesTable } from "./table";

const { osKey } = getConfig();

export default async function RoutesPage() {
  const user = await getMembership();
  emitPageView({ user, page: "routes" });
  const routes = await db.query.route.findMany({
    with: { rides: true },
  });

  return <RoutesTable routes={routes} osKey={osKey} />;
}
