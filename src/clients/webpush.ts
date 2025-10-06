import { getConfig } from "@/lib/config";
import webpush from "web-push";

const config = getConfig();

webpush.setVapidDetails("mailto:condors@rdrn.me", config.vapid.public, config.vapid.private);
export { webpush };
