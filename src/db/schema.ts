import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Note: we're using `timestamp` throughout, rather than `timestamptz`
// Node dates are always UTC and we avoid the (unlikely) case
// that the Postgres TIMEZONE changes and we start getting weird results

const id = () => text("id").$default(nanoid).primaryKey();
const slug = () => text("slug").unique().notNull().$default(nanoid);
const deletedAt = () => timestamp("deleted_at");
const createdAt = () => timestamp("created_at").notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date());

// *****************************************
// Core user session tables from better-auth
// *****************************************
export const userTypeArray = ["user", "admin"] as const;
export const userType = pgEnum("user_type", userTypeArray);
export const user = pgTable(
  "user",
  {
    id: id(),
    name: text("name").notNull(),
    type: userType("type").notNull().default("user"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),

    deactivatedAt: timestamp("deactivated_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (_table) => [],
);
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  rides: many(ride),
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
  },
  (_table) => [],
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
export const rideSurfaceArray = ["road", "gravel"] as const;
export const rideSurface = pgEnum("ride_surface", rideSurfaceArray);
export const ride = pgTable(
  "ride",
  {
    id: id(),
    slug: slug(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),

    name: text("name").notNull(),
    notes: text("notes"),

    date: date("date", { mode: "date" }).notNull(),
    time: time("time").notNull(),

    speed: text("speed").notNull(),
    distance: integer("distance").notNull(),
    elevation: integer("elevation"),
    surface: rideSurface("surface").notNull().default("road"),
    route: text("route"),

    maxGroupSize: integer("max_group_size"),
    cafeStop: text("cafe_stop"),
    startPoint: text("start_point").notNull().default("Beeline Bicycles"),

    geojson: jsonb("geojson").$type<GeoJSON.LineString>(),

    unclaimed: boolean("unclaimed").notNull().default(false),
    canceledAt: timestamp("canceled_at"),
    deletedAt: timestamp("deleted_at"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("ride__user_id_idx").on(table.userId)],
);
export const rideRelations = relations(ride, ({ one, many }) => ({
  leader: one(user, {
    fields: [ride.userId],
    references: [user.id],
  }),
  members: many(rideMember),
  comments: many(comment),
  changes: many(rideChange),
  views: many(rideView),
}));

export const rideChange = pgTable(
  "ride_change",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rideId: text("ride_id")
      .references(() => ride.id)
      .notNull(),
    note: text("note").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("ride_change__ride_id_idx").on(table.rideId)],
);
export const rideChangeRelations = relations(rideChange, ({ one }) => ({
  ride: one(ride, {
    fields: [rideChange.rideId],
    references: [ride.id],
  }),
}));

export const rideView = pgTable(
  "ride_view",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rideId: text("ride_id")
      .notNull()
      .references(() => ride.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("activity__user_id_ride_id_unique_idx").on(table.userId, table.rideId)],
);
export const activityRelations = relations(rideView, ({ one }) => ({
  user: one(user, {
    fields: [rideView.userId],
    references: [user.id],
  }),
  ride: one(ride, {
    fields: [rideView.rideId],
    references: [ride.id],
  }),
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
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("ride_member__user_id_idx").on(table.userId),
    uniqueIndex("ride_member__ride_id_user_id_unique_idx").on(table.rideId, table.userId),
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

// *****************************************
// Comments
// *****************************************
export const comment = pgTable(
  "comment",
  {
    id: id(),
    rideId: text("ride_id")
      .notNull()
      .references(() => ride.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    text: text("text").notNull(),

    deletedAt: deletedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("comment__ride_id_idx").on(table.rideId),
    index("comment__user_id_idx").on(table.userId),
  ],
);
export const commentRelations = relations(comment, ({ one, many }) => ({
  ride: one(ride, {
    fields: [comment.rideId],
    references: [ride.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  reactions: many(commentReaction),
}));

export const commentReaction = pgTable(
  "comment_reaction",
  {
    id: id(),
    commentId: text("comment_id")
      .notNull()
      .references(() => comment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("comment_reaction__user_id_idx").on(table.userId),
    uniqueIndex("comment_reaction__comment_id_user_id_unique_idx").on(
      table.commentId,
      table.userId,
    ),
  ],
);
export const commentReactionRelations = relations(commentReaction, ({ one }) => ({
  comment: one(comment, {
    fields: [commentReaction.commentId],
    references: [comment.id],
  }),
  user: one(user, {
    fields: [commentReaction.userId],
    references: [user.id],
  }),
}));

// *****************************************
// External auth
// *****************************************
export const routeSiteArray = ["strava", "ridewithgps"] as const;
export const externalApi = pgEnum("external_api", routeSiteArray);
export const token = pgTable(
  "token",
  {
    site: externalApi("site").primaryKey(),
    accessToken: text("access_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    refreshToken: text("refresh_token").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (_table) => [],
);
