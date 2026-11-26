// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  AvatarError,
  avatarKeyFromUrl,
  avatarUrl,
  isAvatarKey,
  newAvatarKey,
  processAvatar,
} from "./avatar";

async function png(width: number, height: number) {
  const buf = await sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 50, b: 100 } },
  })
    .png()
    .toBuffer();
  return new Uint8Array(buf);
}

describe("processAvatar", () => {
  it("converts to a 512x512 webp", async () => {
    const out = await processAvatar(await png(1200, 800));
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(512);
    expect(meta.height).toBe(512);
    expect(meta.exif).toBeUndefined();
  });

  it("rejects tiny images", async () => {
    await expect(processAvatar(await png(32, 32))).rejects.toBeInstanceOf(AvatarError);
  });

  it("rejects non-images", async () => {
    const bytes = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>");
    await expect(processAvatar(bytes)).rejects.toBeInstanceOf(AvatarError);
  });

  it("rejects empty input", async () => {
    await expect(processAvatar(new Uint8Array())).rejects.toBeInstanceOf(AvatarError);
  });
});

describe("avatar keys", () => {
  it("round-trips key and url", () => {
    const key = newAvatarKey("user_123");
    expect(isAvatarKey(key)).toBe(true);
    expect(avatarKeyFromUrl(avatarUrl(key))).toBe(key);
  });

  it("ignores external and malicious urls", () => {
    expect(avatarKeyFromUrl("https://lh3.googleusercontent.com/a/abc")).toBeNull();
    expect(avatarKeyFromUrl("/avatars/../secret.webp")).toBeNull();
    expect(avatarKeyFromUrl(null)).toBeNull();
    expect(isAvatarKey("avatars/a/b/c.webp")).toBe(false);
  });
});
