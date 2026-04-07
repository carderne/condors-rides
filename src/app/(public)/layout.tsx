import { HeaderBar } from "@/components/header/header";
import { maybeGetMembership } from "@/dal/membership";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await maybeGetMembership();
  return (
    <>
      <HeaderBar user={user} />
      <div className="w-full">{children}</div>
    </>
  );
}
