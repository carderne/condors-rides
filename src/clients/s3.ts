import { getConfig } from "@/lib/config";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    const { s3 } = getConfig();
    client = new S3Client({
      endpoint: s3.endpoint,
      region: s3.region,
      credentials: { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey },
      // Garage only supports path-style addressing (no bucket subdomains)
      forcePathStyle: true,
    });
  }
  return client;
}

function bucket(): string {
  return getConfig().s3.bucket;
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await getClient().send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }),
  );
}

export async function getObject(key: string) {
  try {
    const res = await getClient().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    if (!res.Body) return null;
    return { body: res.Body.transformToWebStream(), contentType: res.ContentType };
  } catch (e) {
    if (e instanceof Error && e.name === "NoSuchKey") return null;
    throw e;
  }
}

export async function deleteObject(key: string) {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
