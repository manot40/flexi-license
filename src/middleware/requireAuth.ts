import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import { apiToken } from 'services';
import { verify } from 'services/jwt';

type NextReqWithUser = NextReq & {
  user: User & { type?: 'API_TOKEN' | 'USER_TOKEN' };
};

type AuthRuleOption = {
  method: string;
  role: User['role'] | User['role'][];
};

export type AuthOptions = {
  rule?: AuthRuleOption[];
};

export type CtxWithUser = (req: NextReqWithUser, res: NextRes) => Promise<void>;

export async function getAuthUser(req: { cookies: NextReq['cookies']; headers: NextReq['headers'] }) {
  const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if (!accessToken) return null;

  const user = await verify<NextReqWithUser['user']>(accessToken);
  if (!user) return null;

  if (user.type === 'API_TOKEN') {
    const token = await apiToken.getUnique({ token: accessToken });
    if (!token || !token.isActive) return null;
  }

  return user;
}

export default function requireAuth(cb: CtxWithUser, options = {} as AuthOptions) {
  return async function handler(req: NextReqWithUser, res: NextRes) {
    const user = await getAuthUser(req);

    if (!user || !user.isActive)
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, please check your credentials',
      });

    req.user = user;

    if (options.rule) {
      const { role } = options.rule.find((rule) => new RegExp(rule.method, 'i').test(req.method!)) || {};

      if (role && !role.includes(user.role))
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to access this resource',
        });
    }

    return cb(req, res);
  };
}
