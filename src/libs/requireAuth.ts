import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import { verify } from 'services/jwt';

export async function getAuthUser(req: NextReq) {
  const accessToken = req.cookies.accessToken;
  if (accessToken) return await verify<User>(accessToken);
  return null;
}

export default function requireAuth(cb: (req: NextReq, res: NextRes) => Promise<void>) {
  return async function handler(req: Req<NextReq>, res: NextRes) {
    const user = await getAuthUser(req);
    if (!user)
      res.status(401).json({
        success: false,
        message: 'Unauthorized, please login to your account',
      });
    else cb(req, res);
  };
}
