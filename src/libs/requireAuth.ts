import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import { verify } from 'services/jwt';

type NextReqWithUser = NextReq & {
  user: User;
};

export async function getAuthUser(req: NextReq) {
  const accessToken = req.cookies.accessToken;
  if (accessToken) return await verify<User>(accessToken);
  return null;
}

export default function requireAuth(cb: (req: NextReqWithUser, res: NextRes) => Promise<void>) {
  return async function handler(req: NextReqWithUser, res: NextRes) {
    const user = await getAuthUser(req);

    if (!user || !user.isActive)
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, please login to your account',
      });

    req.user = user;

    return cb(req, res);
  };
}
