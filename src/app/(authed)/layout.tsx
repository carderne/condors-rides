import { Header } from "@/components/header/header";
import { getMembership } from "@/dal/membership";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getMembership();
  return (
    <div className="">
      <Header />
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
