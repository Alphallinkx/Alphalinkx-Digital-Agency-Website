import { isIP } from 'node:net';
import { NextResponse } from 'next/server';

export async function readJson(request: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const chunks: string[] = [];

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        void reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
    return JSON.parse(chunks.join('') + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

const buckets = new Map<string, { expires: number; count: number }>();
const windowMs = 60_000;
const maxBuckets = 10_000;

export function requestClient(request: Request) {
  const headerName = process.env.TRUSTED_CLIENT_IP_HEADER;
  const value = headerName ? request.headers.get(headerName)?.trim() : undefined;
  return value && isIP(value) ? value : 'unidentified';
}

export function rateLimit(key: string, limit: number) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.expires <= now) {
    if (buckets.size >= maxBuckets) {
      for (const [id, entry] of buckets) {
        if (entry.expires <= now) buckets.delete(id);
      }
      if (buckets.size >= maxBuckets && !buckets.has(key)) return tooManyRequests(60);
    }
    bucket = { expires: now + windowMs, count: 0 };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) return tooManyRequests(Math.ceil((bucket.expires - now) / 1000));
}

function tooManyRequests(retryAfter: number) {
  return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, {
    status: 429,
    headers: { 'Retry-After': String(retryAfter) },
  });
}
