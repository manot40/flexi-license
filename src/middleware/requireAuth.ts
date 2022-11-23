import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import { verify } from 'services/jwt';

type NextReqWithUser = NextReq & {
  user: User;
};

type AuthRuleOption = {
  method: string;
  role: User['role'] | User['role'][];
};

export type AuthOptions = {
  rule?: AuthRuleOption[];
};

export type CtxWithUser = (req: NextReqWithUser, res: NextRes) => Promise<void>;

export async function getAuthUser(req: { cookies: any }) {
  const accessToken = req.cookies.accessToken;
  if (accessToken) return await verify<User>(accessToken);
  return null;
}

export default function requireAuth(cb: CtxWithUser, options = {} as AuthOptions) {
  return async function handler(req: NextReqWithUser, res: NextRes) {
    const user = await getAuthUser(req);

    if (!user || !user.isActive)
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, please login to your account',
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
