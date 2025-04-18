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
      <div className="mx-auto w-full p-4 md:max-w-[120ch]">{children}</div>
    </>
  );
}
