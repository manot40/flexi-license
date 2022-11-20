import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import QueryHelper from 'libs/queryHelper';
import validator, { createCompany } from 'libs/validator';

import { keys } from '.';

export default requireAuth(async (req, res) => {
  const id = req.query.id;

  if (typeof id != 'string')
    return res.status(400).json({
      succcess: false,
      message: 'Company id not provided',
    });

  const query = new QueryHelper(req.query, keys);

  switch (req.method) {
    case 'GET': {
      try {
        const result = await db.company.findUnique({ where: { id }, select: query.getSelect() });

        if (!result)
          return res.status(404).json({
            success: false,
            message: 'Company not found',
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
        const errMsg = await validator(createCompany, req.body);
        if (errMsg) return res.status(400).json({ success: false, message: errMsg });

        const result = await db.company.update({
          where: { id },
          data: {
            name: req.body.name,
            contactName: req.body.contactName,
            contactNumber: req.body.contactNumber,
            updatedBy: req.user.username,
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
        const result = await db.company.update({
          where: { id },
          data: {
            ...query.parseData(req.body),
            updatedBy: req.user.id,
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

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
});
