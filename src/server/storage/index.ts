import { randomUUID } from "node:crypto"
import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

import { env } from "@/env"

/**
 * SeaweedFS object storage over the S3 API. ADF media is public from the start: uploads go
 * straight to the public bucket, which carries an anonymous s3:GetObject
 * bucket policy so bare <img> tags work. Swap STORAGE_PUBLIC_BASE_URL for a
 * CDN hostname in prod with zero code change.
 */

export const s3 = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT,
  forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET_KEY,
  },
})

type BucketKind = "public" | "private"

function bucketName(bucket: BucketKind): string {
  return bucket === "public"
    ? env.STORAGE_PUBLIC_BUCKET
    : env.STORAGE_PRIVATE_BUCKET
}

// Lazy, memoized bucket bootstrap — the create + policy
// calls run at most once per process per bucket, on first use.
const bucketReady = new Map<BucketKind, Promise<void>>()

async function createBucketIfNeeded(bucket: BucketKind) {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName(bucket) }))
  } catch (error) {
    if (!isBucketAlreadyPresent(error)) throw error
  }
  // Idempotent whether the bucket was just created or already existed.
  if (bucket === "public") await ensurePublicReadPolicy()
}

function isBucketAlreadyPresent(error: unknown): boolean {
  const err = error as {
    name?: string
    $metadata?: { httpStatusCode?: number }
  }
  return (
    err.name === "BucketAlreadyOwnedByYou" ||
    err.name === "BucketAlreadyExists" ||
    err.$metadata?.httpStatusCode === 409
  )
}

/** Anonymous read on the public bucket — objects rely on this, not per-object ACLs. */
async function ensurePublicReadPolicy() {
  const name = bucketName("public")
  await s3.send(
    new PutBucketPolicyCommand({
      Bucket: name,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${name}/*`],
          },
        ],
      }),
    })
  )
}

export async function ensureBucket(bucket: BucketKind): Promise<void> {
  if (!env.STORAGE_AUTO_CREATE_BUCKET) return
  if (!bucketReady.has(bucket)) {
    bucketReady.set(
      bucket,
      createBucketIfNeeded(bucket).catch((error) => {
        // Don't memoize failures — retry on the next call.
        bucketReady.delete(bucket)
        throw error
      })
    )
  }
  await bucketReady.get(bucket)
}

/**
 * Object key: `<NODE_ENV>/<folder>/<16-hex>-<sanitized-name>` — envs can share a bucket without colliding.
 */
export function generateKey(filename: string, folder?: string): string {
  const unique = randomUUID().replace(/-/g, "").slice(0, 16)
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  const base = `${unique}-${safeName || "file"}`
  const path = folder ? `${folder}/${base}` : base
  return `${env.NODE_ENV}/${path}`
}

export async function putObject({
  key,
  body,
  contentType,
  bucket = "public",
}: {
  key: string
  body: Buffer | Uint8Array
  contentType: string
  bucket?: BucketKind
}): Promise<void> {
  await ensureBucket(bucket)
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName(bucket),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}

export async function deleteObjects(
  keys: string[],
  bucket: BucketKind = "public"
): Promise<void> {
  if (keys.length === 0) return
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: bucketName(bucket),
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    })
  )
}

/** Public URL for an object key — base URL falls back to `${endpoint}/${publicBucket}`. */
export function getPublicUrl(key: string): string {
  const base =
    env.STORAGE_PUBLIC_BASE_URL ??
    `${env.STORAGE_ENDPOINT}/${env.STORAGE_PUBLIC_BUCKET}`
  return `${base.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`
}
