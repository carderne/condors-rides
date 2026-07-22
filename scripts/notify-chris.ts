import { sendNotifications } from "@/clients/notify";

async function main() {
  const userId = "TFGpw__RiBUMJu_RQ39l9";
  const deviceId = "c5a5cf10-e952-424c-9fb4-99722cd77ae4";
  const token =
    "ciiFPrHIbkLuoVd_k3s99s:APA91bHB7J6gg_PG9f5-PpB0hB5GG7x9x0t4_ghmEA_HYO779x0WXnUbyHlxN8Jb2zJNiqn0HpTxV1KrrMVGS_aWAJ0pQMW_g_tCxQdtb-eyDMvawCrrs3E";
  const target = { userId, deviceId, token };
  const slug = "2026-03-15-flat-100k";
  const properties = { rideSlug: slug, type: "new" };

  await sendNotifications({
    targets: [target],
    title: "TEST NOTIFICATION",
    body: "HI CHRIS",
    slug,
    properties,
  });
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
