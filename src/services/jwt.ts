import ms from 'ms';
import { SignJWT, jwtVerify } from 'jose';

const te = new TextEncoder();
const JWTSecretKey = process.env.NEXT_JWT_SECRET || 'supers3cret';
const JWTExpiration = process.env.NEXT_JWT_EXPIRATION || '1d';

export const Expiry = ms(JWTExpiration);

export const sign = async (data: any) =>
  await new SignJWT(data)
    .setExpirationTime(JWTExpiration)
    .setIssuedAt(+(Date.now() / 1000).toFixed(0))
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(te.encode(JWTSecretKey));

export const verify = async <T = any>(token: string) => {
  try {
    const { payload } = await jwtVerify(token, te.encode(JWTSecretKey));
    if (payload) return payload as T;
  } catch (err: any) {
    return null;
  }
  return null;
};
