import { H3 } from "@/components/ui/typography";
import Link from "next/link";

export function AccessMessage() {
  return (
    <div className="flex flex-col items-center gap-2">
      <H3>Only paid-up members can access this part of the site.</H3>
      <p>
        To find out about joining the club,{" "}
        <Link href="https://cowleyroadcondors.cc/join/" className="text-primary hover:underline">
          click here.
        </Link>
      </p>
      <p className="text-muted-foreground text-sm">
        This is a new restriction and we still need to mark everyone as paid, please be patient.
      </p>
    </div>
  );
}
