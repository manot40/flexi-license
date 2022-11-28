import ms from 'ms';
import { SignJWT, jwtVerify, type JWTVerifyOptions } from 'jose';

const te = new TextEncoder();
const JWTSecretKey = process.env.NEXT_JWT_SECRET || 'supers3cret';
const JWTExpiration = process.env.NEXT_JWT_EXPIRATION || '1d';

export const Expiry = {
  default: ms(JWTExpiration),
  OneDay: ms('1d'),
  OneWeek: ms('1w'),
  OneMonth: ms('1m'),
  OneYear: ms('1y'),
  SixMonths: ms('180d'),
};

export const sign = (data: any, opts = {} as { iat?: number; exp?: number | null }) => {
  const signer = new SignJWT(data);

  signer.setIssuedAt(opts.iat || +(Date.now() / 1000).toFixed(0)).setProtectedHeader({ alg: 'HS256', typ: 'JWT' });

  if (opts.exp !== null) signer.setExpirationTime(opts.exp || JWTExpiration);

  return signer.sign(te.encode(JWTSecretKey));
};

export const verify = async <T = any>(token: string, opts?: JWTVerifyOptions) => {
  try {
    const { payload } = await jwtVerify(token, te.encode(JWTSecretKey), opts);
    if (payload) return payload as T;
  } catch (err: any) {
    return null;
  }
  return null;
};
