import { H2 } from "@/components/ui/typography";
import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <div>
      <H2>Data deletion</H2>
      <p className="mt-10">
        To delete all your data, please contact the club at{" "}
        <Link href="mailto:info@cowleyroadcondors.cc" className="text-primary">
          info@cowleyroadcondors.cc
        </Link>
      </p>
    </div>
  );
}
