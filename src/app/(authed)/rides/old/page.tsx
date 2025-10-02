import { redirect } from "next/navigation";

export default function OldRides() {
  redirect("/rides/recent");
}
