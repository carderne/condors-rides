import { nanoid } from "nanoid";
import sharp, { type Metadata, type Sharp } from "sharp";
import { AVATAR_MAX_BYTES } from "./avatar-limits";

const MIN_DIMENSION = 64;
const MAX_INPUT_PIXELS = 50_000_000; // ~50MP, guards against decompression bombs
const OUTPUT_SIZE = 512;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif"]);

// Avatars are stored at avatars/<userId>/<id>.webp and served at /avatars/<userId>/<id>.webp
const PATH_PREFIX = "/avatars/";
const KEY_RE = /^avatars\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.webp$/;

export class AvatarError extends Error {}

export function newAvatarKey(userId: string): string {
  return `avatars/${userId}/${nanoid()}.webp`;
}

export function isAvatarKey(key: string): boolean {
  return KEY_RE.test(key);
}

export function avatarUrl(key: string): string {
  return `/${key}`;
}

/** Returns the storage key if the URL points to one of our stored avatars. */
export function avatarKeyFromUrl(url: string | null | undefined): string | null {
  if (!url?.startsWith(PATH_PREFIX)) return null;
  const key = url.slice(1);
  return isAvatarKey(key) ? key : null;
}

/** Validates an uploaded image and converts it to a square 512x512 WebP without metadata. */
export async function processAvatar(input: Uint8Array): Promise<Uint8Array> {
  if (input.byteLength === 0) throw new AvatarError("No image selected");
  if (input.byteLength > AVATAR_MAX_BYTES) throw new AvatarError("Image must be under 8MB");

  let image: Sharp;
  let meta: Metadata;
  try {
    image = sharp(Buffer.from(input), { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });
    meta = await image.metadata();
  } catch {
    throw new AvatarError("Could not read image, try a JPEG or PNG");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new AvatarError("Unsupported image type, use JPEG, PNG, WebP or HEIC");
  }
  if (meta.width * meta.height > MAX_INPUT_PIXELS) {
    throw new AvatarError("Image dimensions are too large");
  }
  if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
    throw new AvatarError(`Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels`);
  }

  try {
    const out = await image
      .rotate() // apply EXIF orientation before metadata is stripped
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "cover",
        position: "attention",
        withoutEnlargement: false,
      })
      .webp({ quality: 80 })
      .toBuffer();
    return new Uint8Array(out);
  } catch {
    throw new AvatarError("Could not process image, try a JPEG or PNG");
  }
}
