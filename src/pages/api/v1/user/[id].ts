import db from 'libs/db';

import requireAuth from 'libs/requireAuth';
import QueryHelper from 'libs/queryHelper';
import errorHandler from 'libs/errorHandler';

export default requireAuth(
  async (req, res) => {
    try {
      const id = req.query.id;

      if (typeof id != 'string')
        return res.status(400).json({
          succcess: false,
          message: 'User id not provided',
        });

      const superadmin =
        /^((?!GET).)*$/.test(req.method!) && (await db.user.findUnique({ where: { username: 'superadmin' } }));

      if (superadmin && superadmin.id == id)
        return res.status(400).json({
          success: false,
          message: 'User superadmin cannot be modified',
        });

      const qh = new QueryHelper(req.query, ['password']);

      switch (req.method) {
        case 'GET': {
          const result = await db.user.findUnique({ where: { id }, select: qh.getSelect() });

          if (!result)
            return res.status(404).json({
              success: false,
              message: 'User not found',
            });

          return res.status(200).json({
            success: true,
            result,
          });
        }

        case 'PUT': {
          const result = await db.user.update({
            where: { id },
            data: {
              username: req.body.username,
              role: req.body.role,
              isActive: req.body.isActive,
            },
          });

          return res.status(200).json({
            success: true,
            result,
          });
        }

        case 'PATCH': {
          const { password, ...data } = qh.parseData(req.body, ['role', 'isActive'] as (keyof User)[]);

          const result = await db.user.update({ where: { id }, data });

          return res.status(200).json({
            success: true,
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
      return res.status(code).json({ success: false, message });
    }
  },
  {
    allowRule: [{ method: '.*', role: 'ADMIN' }],
  }
);
