import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(expiry) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET).update(String(expiry)).digest('hex');
}

export function sessionCreate() {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const value = `${expiry}.${sign(expiry)}`;
  return { name: SESSION_COOKIE_NAME, value, maxAge: MAX_AGE_SECONDS };
}

export function sessionVerify(cookieValue) {
  if (!process.env.SESSION_SECRET || !cookieValue) return false;

  const [expiryStr, signature] = cookieValue.split('.');
  if (!expiryStr || !signature) return false;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expected = Buffer.from(sign(expiry));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;

  return crypto.timingSafeEqual(expected, actual);
}