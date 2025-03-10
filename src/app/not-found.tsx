import { H1 } from "@/components/ui/typography";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <H1>404 Not Found</H1>
      <p>Could not find requested resource</p>
      <Link href="/" className="text-primary mt-4">
        Return Home
      </Link>
    </div>
  );
}
