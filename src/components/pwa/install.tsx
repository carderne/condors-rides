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
import type { User } from "@/db/zod";
import { useDeviceType } from "@/hooks/device-type";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ShareIcon, SquarePlusIcon } from "lucide-react";
import Link from "next/link";
import { clickedInstallAction, clickedNotifyAction } from "./actions";

export function InstallPwaButton({ user }: { user: User | null }) {
  const deviceType = useDeviceType();

  if (!user) {
    return null;
  }

  // We're only doing this for iOS until I figure out Android notifications
  if (deviceType === "other") {
    return null;
  }

  if (deviceType === "ios-pwa") {
    // If the user already has notifications enabled
    if (user.webpushSub) {
      return null;
    }
    return (
      <Button variant="outline" extra="action" asChild onClick={clickedNotifyAction}>
        <Link href="/settings">Enable notifications!</Link>
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" extra="action" onClick={clickedInstallAction}>
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
  return deviceType === "ios" ? (
    <InstallInstructions />
  ) : deviceType === "ios-pwa" ? (
    "Already installed"
  ) : (
    "Only available on iOS right now"
  );
}
