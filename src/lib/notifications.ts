/*
 * This function is replaced by the webview on the Android/iOS apps
 */
export async function askPermission(): Promise<"granted" | "denied" | "default"> {
  const permissionResult = await new Promise<"granted" | "denied" | "default">(
    (resolve, reject) => {
      const maybePromise = Notification.requestPermission((result) => {
        resolve(result);
      });

      if (maybePromise) {
        maybePromise.then(resolve, reject);
      }
    },
  );

  return permissionResult;
}
