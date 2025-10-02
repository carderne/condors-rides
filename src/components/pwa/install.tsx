"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ShareIcon, SquarePlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function useDeviceType() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const deviceType = isStandalone ? "ios-pwa" : isIOS ? "ios-safari" : "other";

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  return deviceType;
}

export function InstallPwaButton({ showNotificationPrompt }: { showNotificationPrompt: boolean }) {
  const deviceType = useDeviceType();
  // We're only doing this for iOS until I figure out Android notifications
  if (deviceType === "other") {
    return null;
  }

  if (deviceType === "ios-pwa") {
    if (!showNotificationPrompt) {
      return null;
    }
    return (
      <Button variant="outline" extra="action" asChild>
        <Link href="/settings">Enable notifications!</Link>
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" extra="action">
          Install the Condors App!
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install as App</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <InstallInstructions />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">OK</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InstallInstructions() {
  return (
    <ol className="space-y-3 text-sm">
      <li className="flex items-start gap-3">
        <ShareIcon className="text-primary font-medium" />
        <span>Tap Share</span>
      </li>

      <li className="flex items-start gap-3">
        <SquarePlusIcon className="text-primary font-medium" />
        <span>Swipe up and tap Add to Home Screen</span>
      </li>
    </ol>
  );
}

export function InstallPwaCard() {
  const deviceType = useDeviceType();
  return deviceType === "ios-safari" ? (
    <InstallInstructions />
  ) : deviceType === "ios-pwa" ? (
    "Already installed"
  ) : (
    "Only available on iOS right now"
  );
}
