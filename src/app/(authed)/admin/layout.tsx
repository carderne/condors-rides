import { getAdminUser } from "@/dal/membership";

export default async function AdminPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getAdminUser();
  return children;
}
