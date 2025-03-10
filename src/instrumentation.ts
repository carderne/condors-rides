import { getConfig } from "@/lib/config";

export async function register() {
  // call this to check all env vars at startup
  getConfig();
}
