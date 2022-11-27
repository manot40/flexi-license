import bcrypt from 'bcryptjs';

import db from 'libs/db';
import errorHandler from 'libs/errorHandler';
import QueryHelper, { pagination } from 'libs/queryHelper';

import validator from 'validator';
import { authenticateUser } from 'validator/user';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

const handler: CtxWithUser = async (req, res) => {
  try {
    switch (req.method) {
      case 'GET': {
        const qh = new QueryHelper(req.query, ['password']);

        const where = qh.getWhere();
        const count = await db.user.count({ where });
        const { take, skip, ...paginate } = pagination(req.query, count);

        const result = await db.user.findMany({
          take,
          skip,
          where,
          select: qh.getSelect(),
          orderBy: qh.getOrderBy(),
        });

        return res.status(200).json({
          success: true,
          paginate,
          result,
        });
      }

      case 'POST': {
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
      }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (err) {
    const { code, message } = errorHandler(err);
    return res.status(code).json({
      success: false,
      message,
    });
  }
};

export default requireAuth(handler, {
  rule: [{ method: '.*', role: 'ADMIN' }],
});
