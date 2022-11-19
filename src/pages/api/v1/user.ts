import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import db from 'libs/db';
import bcrypt from 'bcryptjs';
import validator from 'libs/validator';
import requireAuth from 'libs/requireAuth';
import { authenticateUser } from 'libs/validator/user';

export default requireAuth(async (req, res) => {
  switch (req.method) {
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

      const { createdAt, updatedAt, password, ..._user } = user;

      return res.status(200).json({
        success: true,
        message: 'User created',
        data: _user,
      });
    }
  }
});
