import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import QueryHelper from 'libs/queryHelper';

import { keys } from '.';

export default requireAuth(async (req, res) => {
  const id = req.query.id;

  if (typeof id != 'string')
    return res.status(400).json({
      succcess: false,
      message: 'Company id not provided',
    });

  const qh = new QueryHelper(req.query, keys);

  switch (req.method) {
    case 'GET': {
      try {
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
      } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }

    case 'PUT': {
      try {
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
      } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }

    case 'PATCH': {
      try {
        const { password, ...data } = qh.parseData(req.body);

        const result = await db.user.update({ where: { id }, data });

        return res.status(200).json({
          success: true,
          result,
        });
      } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
});
