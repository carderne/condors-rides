"use server";

import { getSuperUser } from "@/dal/membership";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { type State, validator } from "./validate";

export async function action(
  existingRouteId: string,
  _: State,
  formData: FormData,
): Promise<State> {
  await getSuperUser();
  const where = eq(schema.route.id, existingRouteId);
  const existingRoute = await db.query.route.findFirst({ where });

  if (!existingRoute) {
    return notFound();
  }

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;

  const insertable = {
    ...data,
    // convert undefined to null
    // so they clear the db column if not set
    notes: data.notes ?? null,
    cafeStop: data.cafeStop ?? null,
  };

  await db.update(schema.route).set(insertable).where(where);

  redirect("/routes");
}
