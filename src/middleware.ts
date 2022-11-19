import { NextResponse, type NextRequest as NextReq, type NextFetchEvent as NextEvent } from 'next/server';

//import { jwtVerify } from "jose";

export async function middleware(req: NextReq & { user: User }, event: NextEvent) {
  return NextResponse.next();
}
