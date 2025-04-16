import { getMembership } from "@/dal/membership";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getMembership();
  return children;
}
