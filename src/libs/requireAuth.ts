import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import { verify } from 'services/jwt';

type NextReqWithUser = NextReq & {
  user: User;
};

type AllowedRuleOption = {
  method: string;
  role: User['role'] | User['role'][];
};

type AuthOptions = {
  allowRule?: AllowedRuleOption[];
};

export async function getAuthUser(req: NextReq) {
  const accessToken = req.cookies.accessToken;
  if (accessToken) return await verify<User>(accessToken);
  return null;
}

export default function requireAuth(
  cb: (req: NextReqWithUser, res: NextRes) => Promise<void>,
  options = {} as AuthOptions
) {
  return async function handler(req: NextReqWithUser, res: NextRes) {
    const user = await getAuthUser(req);

    if (!user || !user.isActive)
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, please login to your account',
      });

    req.user = user;

    if (options.allowRule) {
      const { role } = options.allowRule.find((rule) => new RegExp(rule.method, 'i').test(req.method!)) || {};

      if (role && !role.includes(user.role))
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to access this resource',
        });
    }

    return cb(req, res);
  };
}
