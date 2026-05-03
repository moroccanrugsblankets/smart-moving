interface AttemptRecord {
  count: number;
  windowStart: number;
}

const attempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRecord(ip: string): AttemptRecord {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    return { count: 0, windowStart: now };
  }
  return record;
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const record = getRecord(ip);
  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return { allowed: record.count < MAX_ATTEMPTS, remaining };
}

export function recordFailedAttempt(ip: string): void {
  const record = getRecord(ip);
  record.count += 1;
  attempts.set(ip, record);
}

export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}
