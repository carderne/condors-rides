import { H2 } from "@/components/ui/typography";
import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <div>
      <H2>Data deletion</H2>
      <p>
        To delete your data, log in, go to{" "}
        <Link href="/settings" className="text-primary">
          Settings
        </Link>{" "}
        and choose the option to delete all data
      </p>
    </div>
  );
}
