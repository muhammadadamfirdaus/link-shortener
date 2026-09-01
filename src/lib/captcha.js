export async function captchaVerify(token, ip) {
  if (!token) return false;

  const body = new URLSearchParams();
  body.set('secret', process.env.TURNSTILE_SECRET_KEY || '');
  body.set('response', token);
  if (ip) body.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await response.json();

  return data.success === true;
}