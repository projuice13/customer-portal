import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket() {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set");
  return bucket;
}

export async function r2Put(key: string, body: Buffer, contentType: string) {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function r2Delete(key: string) {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
  );
}

export async function r2GetText(key: string): Promise<string | null> {
  const client = getClient();
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: getBucket(), Key: key })
    );
    return await res.Body!.transformToString();
  } catch (e: unknown) {
    if ((e as { name?: string }).name === "NoSuchKey") return null;
    throw e;
  }
}

export async function r2PresignedDownload(key: string, filename: string, expiresIn = 300) {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function r2ListPrefix(prefix: string) {
  const client = getClient();
  const res = await client.send(
    new ListObjectsV2Command({ Bucket: getBucket(), Prefix: prefix })
  );
  return (res.Contents ?? []).map((o) => o.Key!).filter(Boolean);
}
