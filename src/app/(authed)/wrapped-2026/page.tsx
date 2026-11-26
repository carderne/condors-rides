import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canSeeWrapped } from "./access";
import { Story } from "./components/story";
import { getWrappedData } from "./data";

export const metadata: Metadata = {
  title: "Condors Wrapped 2026",
};

export default async function WrappedPage() {
  const user = await getMembership();
  if (!canSeeWrapped(user)) {
    notFound();
  }
  emitPageView({ user, page: "wrapped" });
  const data = await getWrappedData(user);
  return <Story data={data} />;
}
