import { NextResponse, type NextRequest as NextReq, type NextFetchEvent as NextEvent } from 'next/server';

import { verify } from 'services/jwt';

export async function middleware(req: NextReq, event: NextEvent) {
  const { pathname } = req.nextUrl;
  const regexPath = /(\/dashboard|\/v1)/;
  const user = verify<User>(req.cookies.get('accessToken')?.value || '');

  if (regexPath.test(pathname) && !user) {
    return NextResponse.redirect(`/login?redirect=${pathname}&message=Session expired, please relogin`);
  }

  return NextResponse.next();
}
