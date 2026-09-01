import crypto from 'crypto';

export function passcodeVerify(input) {
  const expected = process.env.LINK_PASSCODE;
  if (!expected) return false;

  const inputHash = crypto.createHash('sha256').update(String(input || '')).digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(inputHash, expectedHash);
}