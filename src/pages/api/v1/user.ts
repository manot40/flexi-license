import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import db from 'libs/db';
import bcrypt from 'bcryptjs';
import validator from 'libs/validator';
import requireAuth from 'libs/requireAuth';
import { authenticateUser } from 'libs/validator/user';
import QueryHelper, { pagination } from 'libs/queryHelper';

type UserKeys = (keyof EntityType<typeof db.user.findMany>)[];

export default requireAuth(async (req, res) => {
  if (req.user.role != 'ADMIN')
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource',
    });

  switch (req.method) {
    case 'GET': {
      const count = await db.user.count();
      const { take, skip, ...paginate } = pagination(req.query, count);

      const query = new QueryHelper(req.query, ['id', 'username', 'role', 'isActive'] as UserKeys);

      const result = await db.user.findMany({
        take,
        skip,
        where: query.getWhere(),
        select: query.getSelect({ password: false }),
        orderBy: query.getOrderBy(),
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
  }
});
