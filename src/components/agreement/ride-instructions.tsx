import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export function RideInstructionsDialog({
  action,
  children,
}: {
  action: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="cursor-pointer" asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] max-w-[90vw] overflow-y-auto !text-left sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome — it looks like you&apos;re new here</AlertDialogTitle>
          <AlertDialogDescription>
            A few quick things to help you get the most from your ride. You may see this message up
            to 3 times.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 text-sm">
          <section className="space-y-2">
            <h3 className="font-semibold">Before you set off</h3>
            <p>
              Introduce yourself to the ride leader and confirm you&apos;re comfortable with group
              riding: hand signals, calls, and close formation. If anything&apos;s unclear, just
              ask.
            </p>
            <p>Helmets are required on all club rides.</p>
            <p>
              Check your bike: working brakes, inflated tyres, smooth gear changes. Bring lights if
              you&apos;re riding around dawn or dusk.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">What to bring</h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>Spares for basic mechanicals: pump, spare tube, tyre levers, allen keys</li>
              <li>
                Clothing for the ride and for stops — getting cold while someone fixes a flat is
                genuinely risky
              </li>
              <li>Food and water suited to the distance and weather</li>
              <li>Emergency contact details somewhere accessible to others</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">If something goes wrong</h3>
            <p>
              Accidents are rare but do happen. Please report any incident to a board member. For
              head injuries, follow our guidance.
            </p>
            <p>
              More on how we ride as a group:{" "}
              <Link
                className="text-primary hover:underline"
                href="https://cowleyroadcondors.cc/group-ride-policy/"
              >
                group ride policy
              </Link>
              .
            </p>
          </section>

          <p>
            Enjoyed your first few rides? Time to{" "}
            <Link
              className="text-primary hover:underline"
              href="https://cowleyroadcondors.cc/join/"
            >
              join the flock
            </Link>
            .
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction className="cursor-pointer" onClick={action}>
            Join ride
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
