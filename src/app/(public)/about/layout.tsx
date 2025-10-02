import { Container } from "@/components/container";
import Link from "next/link";

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container>
      <div className="mx-auto flex flex-col gap-4 md:flex-row">
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
    </Container>
  );
}
