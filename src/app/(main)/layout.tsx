export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full">
      <div className="mx-auto h-full w-full px-4 sm:px-6 md:max-w-screen-md lg:max-w-screen-lg lg:px-8">
        {children}
      </div>
    </div>
  );
}
