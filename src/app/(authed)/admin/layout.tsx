import { getAdmin } from "@/dal/membership";

export default async function AdminPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getAdmin();
  return children;
}
