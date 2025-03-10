import { getConfig } from "@/lib/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { dbUrl } = getConfig();
const client = new pg.Pool({
  // this url needs sslmode=require
  connectionString: dbUrl,
  idleTimeoutMillis: 0, // never drop connections
});
export const db = drizzle({ schema, client });

export { schema };
