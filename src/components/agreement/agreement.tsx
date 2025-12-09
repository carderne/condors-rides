import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { H1, H3 } from "@/components/ui/typography";
import Link from "next/link";
import { agreePrivacy } from "./actions";

export function PrivacyDialog() {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-h-[80vh] max-w-[90vw] overflow-y-auto !text-left sm:max-w-3xl">
        <AlertDialogHeader>
          <H1>Ride App Privacy Info</H1>
          <AlertDialogDescription>
            Please read the below and click agree (if you do!)
            <br />
            If you don't agree, or have questions or suggestions,{" "}
            <Link
              className="text-primary hover:underline"
              href="https://cowleyroadcondors.cc/contact-us/"
            >
              get in touch.
            </Link>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="text-sm">
          <H3>Visibility</H3>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              Anyone can see the upcoming rides page without logging in. They can't see the leader,
              joiners, or comments—only date, time, start point, and route.
            </li>
            <li>
              Anyone can log in (to make it easy for new members). Once logged in, they can see all
              ride details including leader, joiners, and comments.
            </li>
            <li>
              Admins regularly check registered users and can remove people who shouldn't be there,
              but we can't guarantee only club members have access at any time.
            </li>
          </ul>

          <H3>Past Rides</H3>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              To see past rides, members need to be verified by a site admin (done every few weeks).
            </li>
            <li>
              Past rides show all app-organised rides, joiners, and comments. They are stored
              indefinitely and visible to all verified users.
            </li>
          </ul>

          <H3>Data Collection</H3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Admins can see your email address, IP address, login method, and app interactions
              (viewing rides, commenting, etc.).
            </li>
            <li>This data may be used in aggregate (non-identifiable) to analyse app usage.</li>
            <li>
              Personally identifiable data will only be used for debugging technical issues or
              official club safeguarding cases.
            </li>
          </ul>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Link
              className="text-primary hover:underline"
              href="https://cowleyroadcondors.cc/contact-us/"
            >
              Not sure
            </Link>
          </AlertDialogCancel>
          <AlertDialogAction onClick={agreePrivacy}>Agree</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
