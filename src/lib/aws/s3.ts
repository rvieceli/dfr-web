import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config";

const client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

export function createPresignedUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: config.bucket, Key: key });
  return getSignedUrl(client, command, {
    expiresIn: 3600 * 24 * 3, // 3 days
  });
}

export async function uploadFile(key: string, body: Buffer) {
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
  });

  await client.send(command);

  const audio_url = await createPresignedUrl(key);

  return audio_url;
}
