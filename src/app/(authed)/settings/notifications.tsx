"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { ShareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser } from "./actions";

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  if (!isSupported) {
    return null;
  }

  return (
    <div>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <Button onClick={unsubscribeFromPush}>Unsubscribe</Button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <Button onClick={subscribeToPush}>Subscribe</Button>
        </>
      )}
    </div>
  );
}
export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install Button if already installed
  }

  if (!isIOS) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📱</span>
          Install on iOS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary font-medium">1</span>
              <span className="text-foreground flex">
                Tap <ShareIcon className="ml-2 inline h-4 w-4 align-text-bottom" />
              </span>
            </li>

            <li className="flex items-start gap-3">
              <span className="text-primary font-medium">2</span>
              <span className="text-foreground">
                Scroll down and <span className="font-medium">Add to Home Screen</span>
              </span>
            </li>

            <li className="flex items-start gap-3">
              <span className="text-primary font-medium">3</span>
              <span className="text-foreground">
                Tap <span className="font-medium">Add</span> to confirm
              </span>
            </li>
          </ol>

          <div className="bg-muted mt-6 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              <span className="font-medium">💡</span> Once installed, you can access the app
              directly from your home screen like any other app!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
