import { H2 } from "@/components/ui/typography";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-2">
      <H2>Privacy policy</H2>
      <Link className="text-primary text-xl" href="https://cowleyroadcondors.cc/privacy-policy/">
        See the club's privacy policy here
      </Link>
    </div>
  );
}
