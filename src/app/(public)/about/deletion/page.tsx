import { H2 } from "@/components/ui/typography";
import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <div>
      <H2>Data deletion</H2>
      <p className="">To delete all your data, please contact the club:</p>
      <Link className="text-primary text-xl" href="https://cowleyroadcondors.cc/contact-us/">
        Contact us
      </Link>
    </div>
  );
}
