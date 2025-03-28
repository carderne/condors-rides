import { relations } from "drizzle-orm";
import { boolean, date, index, pgTable, text, time, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Note: we're using `timestamp` throughout, rather than `timestamptz`
// Node dates are always UTC and we avoid the (unlikely) case
// that the Postgres TIMEZONE changes and we start getting weird results

const id = () => text("id").$default(nanoid).primaryKey();
const slug = () => text("slug").unique().notNull().$default(nanoid);
const createdAt = () => timestamp("created_at").notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date());

// *****************************************
// Core user session tables from better-auth
// *****************************************
export const user = pgTable(
  "user",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (_table) => [],
);
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const session = pgTable(
  "session",
  {
    id: id(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session__token_idx").on(table.token)],
);
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const account = pgTable(
  "account",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account__user_id_idx").on(table.userId)],
);
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verification = pgTable(
  "verification",
  {
    id: id(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (_table) => [],
);

// *****************************************
// Ride table
// *****************************************
export const ride = pgTable(
  "ride",
  {
    id: id(),
    slug: slug(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    name: text("name").notNull().default("Unnamed Ride"),
    date: date("date", { mode: "date" }).notNull(),
    time: time("time").notNull(),
    speed: text("speed").notNull(),
    route: text("route").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("ride__user_id_idx").on(table.userId)],
);
export const rideRelations = relations(ride, ({ one, many }) => ({
  user: one(user, {
    fields: [ride.userId],
    references: [user.id],
  }),
  members: many(rideMember),
}));

// *****************************************
// Ride member table
// *****************************************
export const rideMember = pgTable(
  "ride_member",
  {
    id: id(),
    rideId: text("ride_id")
      .references(() => ride.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id").references(() => user.id),
    name: text("name"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("ride_member__ride_id_idx").on(table.rideId),
    index("ride_member__user_id_idx").on(table.userId),
  ],
);

export const rideMemberRelations = relations(rideMember, ({ one }) => ({
  ride: one(ride, {
    fields: [rideMember.rideId],
    references: [ride.id],
  }),
  user: one(user, {
    fields: [rideMember.userId],
    references: [user.id],
  }),
}));
