import { HeaderBar } from "@/components/header/header";
import { getMembership } from "@/dal/membership";

export default async function AuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getMembership();

  return (
    <>
      <HeaderBar user={user} />
      <div className="w-full">{children}</div>
    </>
  );
}
