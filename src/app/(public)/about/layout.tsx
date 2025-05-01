import Link from "next/link";

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-2">
      <div className="flex flex-col gap-4 md:flex-row">
        <Link className="text-primary" href="/about">
          About
        </Link>
        <Link className="text-primary" href="/about/cookies">
          Cookies
        </Link>
        <Link className="text-primary" href="/about/privacy">
          Privacy policy
        </Link>
        <Link className="text-primary" href="/about/deletion">
          Data deletion
        </Link>
      </div>
      {children}
    </div>
  );
}
