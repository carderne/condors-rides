export default async function WelcomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <div className="container mx-12 mx-auto flex max-w-md items-center justify-center">
        {children}
      </div>
    </main>
  );
}
