import { getMembership } from "@/dal/membership";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getMembership();
  return (
    <div className="">
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
