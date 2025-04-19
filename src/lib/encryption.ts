import crypto from "crypto";
import { getConfig } from "./config";

const ALGO = "aes-128-gcm";

const { encryptionKeys } = getConfig();

export function encrypt(text: string): string {
  const [firstKey] = encryptionKeys;
  const key = crypto.createHash("md5").update(firstKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  const encryptedToken = `${iv.toString("hex")}:${authTag}:${encrypted}`;
  return encryptedToken;
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(":");
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error("Invalid encrypted format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  for (const keyString of encryptionKeys) {
    try {
      const key = crypto.createHash("md5").update(keyString).digest();
      const decipher = crypto.createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      continue;
    }
  }

  throw new Error("Decryption failed with all available keys");
}
