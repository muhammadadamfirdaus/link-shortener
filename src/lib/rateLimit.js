const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;

const hits = new Map();

export function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimitCheck(ip) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length <= MAX_REQUESTS;
}