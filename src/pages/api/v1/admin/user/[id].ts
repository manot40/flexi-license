import db from 'libs/db';
import bcrypt from 'bcryptjs';
import errorHandler from 'libs/errorHandler';
import QueryHelper, { parseBody } from 'libs/queryHelper';

import requireAuth, { CtxWithUser } from 'middleware/requireAuth';

const handler: CtxWithUser = async (req, res) => {
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
        const data = parseBody(req.body, ['role', 'isActive', 'password'] as (keyof User)[]);

        if (typeof data.password == 'string') {
          // const { password } = (await db.user.findUnique({ where: { id } })) || {};
          // if (!password) return res.status(404).json({ success: false, message: 'User not found' });

          // const isMatch = await bcrypt.compare(data.password.trim(), password);
          // if (!isMatch)
          //   return res.status(400).json({ success: false, message: "Old password doesn't match our record" });

          data.password = await bcrypt.hash(data.password, 10);
        }

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
};

export default requireAuth(handler, {
  rule: [{ method: '.*', role: 'ADMIN' }],
});
