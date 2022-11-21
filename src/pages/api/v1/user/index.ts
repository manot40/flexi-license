import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import db from 'libs/db';
import bcrypt from 'bcryptjs';
import validator from 'libs/validator';
import requireAuth from 'libs/requireAuth';
import { authenticateUser } from 'libs/validator/user';
import QueryHelper, { pagination } from 'libs/queryHelper';

type UserKey = keyof EntityType<typeof db.user.findMany>;

export const keys = ['id', 'username', 'role', 'isActive', 'updatedAt', 'createdAt'] as UserKey[];

export default requireAuth(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        const qh = new QueryHelper(req.query, keys);

        const where = qh.getWhere();
        const count = await db.user.count({ where });
        const { take, skip, ...paginate } = pagination(req.query, count);

        const result = await db.user.findMany({
          take,
          skip,
          where,
          select: qh.getSelect({ password: false }),
          orderBy: qh.getOrderBy(),
        });

        return res.status(200).json({
          success: true,
          paginate,
          result,
        });
      }

      case 'POST': {
        try {
          const isInvalid = await validator(authenticateUser, req.body);

          if (isInvalid) return res.status(400).json({ success: false, message: isInvalid });

          const user = await db.user.create({
            data: {
              username: req.body.username,
              password: bcrypt.hashSync(req.body.password, 10),
              role: req.body.role,
            },
          });

          const { createdAt, updatedAt, password, ...result } = user;

          return res.status(200).json({
            success: true,
            message: 'User created',
            result,
          });
        } catch (err: any) {
          console.error(err.message);
          const message = /unique/i.test(err.message) ? 'User Already Exist' : 'Internal server error';
          return res.status(500).json({
            success: false,
            message,
          });
        }
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  },
  {
    allowRule: [{ method: '.*', role: 'ADMIN' }],
  }
);
