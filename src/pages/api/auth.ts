import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import db from 'libs/db';
import bcrypt from 'bcryptjs';
import { sign, Expiry } from 'services/jwt';
import { setCookie, deleteCookie } from 'cookies-next';

import validator from 'libs/validator';
import { getAuthUser } from 'libs/requireAuth';
import { createUser } from 'libs/validator/user';

export default async function handler(req: NextReq, res: NextRes) {
  const user = await getAuthUser(req);
  switch (req.method) {
    case 'GET': {
      if (user) {
        return res.status(200).json({ success: true, message: 'Already logged in', result: user });
      } else {
        deleteCookie('accessToken', { req, res, path: '/' });
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    }

    case 'POST': {
      const isInvalid = await validator(createUser, req.body);
      if (isInvalid) return res.status(400).json({ success: false, message: isInvalid });

      const user = await db.user.findUnique({
        where: { username: req.body.username },
      });
      if (!user) return res.status(400).json({ success: false, message: 'Invalid username or password' });

      const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
      if (!isPasswordValid) return res.status(400).json({ success: false, message: 'Invalid username or password' });

      const { createdAt, updatedAt, password, ..._user } = user;
      const token = await sign(_user);
      setCookie('accessToken', token, {
        req,
        res,
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: Expiry,
        secure: process.env.NODE_ENV === 'production',
      });

      return res.status(200).json({ success: true, message: 'Logged in', result: { token } });
    }

    case 'DELETE': {
      if (!user) return res.status(401).json({ success: false, message: 'Not logged in' });
      deleteCookie('accessToken', { req, res, path: '/' });
      return res.status(200).json({ success: true, message: 'Logged out' });
    }
  }
}
