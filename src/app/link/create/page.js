import { cookies } from 'next/headers';
import { sessionVerify, SESSION_COOKIE_NAME } from '@/lib/session';
import FormLogin from '@/app/auth/FormLogin';
import FormUrl from './components/FormUrl';

export default async function LinkCreatePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = sessionVerify(sessionCookie);

  return <main className="mx-auto max-w-md p-6">{authenticated ? <FormUrl /> : <FormLogin />}</main>;
}