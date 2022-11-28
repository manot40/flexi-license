import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';
// Third party libs
import bcrypt from 'bcryptjs';
import { setCookie, deleteCookie } from 'cookies-next';

// Helper Library
import db from 'libs/db';

// Services
import { sign, Expiry } from 'services/jwt';

// Validator
import validator from 'validator';
import { createUser } from 'validator/user';

// Middleware
import { getAuthUser } from 'middleware/requireAuth';

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

      const data = await db.user.findUnique({
        where: { username: req.body.username },
      });

      if (!data)
        return res.status(400).json({
          success: false,
          message: 'Invalid username or password',
        });

      if (!data.isActive)
        return res.status(403).json({
          success: false,
          message: 'Account inactive, please contact your administrator',
        });

      const isPasswordValid = bcrypt.compareSync(req.body.password, data.password);
      if (!isPasswordValid) return res.status(400).json({ success: false, message: 'Invalid username or password' });

      const { createdAt, updatedAt, password, ...user } = data;
      const token = await sign(user, { exp: req.body.remember === true ? Expiry.OneMonth : undefined });
      setCookie('accessToken', token, {
        req,
        res,
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: Expiry.default,
        secure: process.env.NODE_ENV === 'production',
      });

      return res.status(200).json({
        success: true,
        message: 'Logged in',
        result: { user, token },
      });
    }

    case 'DELETE': {
      if (!user) return res.status(401).json({ success: false, message: 'Not logged in' });
      deleteCookie('accessToken', { req, res, path: '/' });
      return res.status(200).json({ success: true, message: 'Logged out' });
    }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
}
