import { getObject } from "@/clients/s3";
import { isAvatarKey } from "@/lib/avatar";

// Public (unauthenticated) so avatars work everywhere <img> does.
// Keys contain a random id and are never reused, so responses are cached forever.
export async function GET(_: Request, { params }: RouteContext<"/avatars/[userId]/[file]">) {
  const { userId, file } = await params;
  const key = `avatars/${userId}/${file}`;
  if (!isAvatarKey(key)) {
    return new Response("Not found", { status: 404 });
  }

  const obj = await getObject(key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
