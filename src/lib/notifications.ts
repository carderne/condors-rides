export async function askPermission(): Promise<"granted" | "denied" | "default"> {
  // This annoying API is because Notification.requestPermission has two forms: async and callback
  // Even though the only version we're using is a version monkey-patched in by the Android/iOS
  // webview (which uses the callback) just keep this function as standard
  const permissionResult = await new Promise<"granted" | "denied" | "default">(
    (resolve, reject) => {
      // This function is replaced by the webview on Android/iOS apps
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
//
