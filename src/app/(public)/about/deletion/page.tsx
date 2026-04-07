import { H2 } from "@/components/ui/typography";
import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <div>
      <H2>Data deletion</H2>
      <p>
        Your account and data can be deleted by visiting your{" "}
        <Link className="text-primary hover:underline" href="/settings">
          Settings
        </Link>{" "}
        page.
      </p>
    </div>
  );
}
