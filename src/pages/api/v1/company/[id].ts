import db from 'libs/db';
import requireAuth from 'libs/requireAuth';

import { fields } from 'libs/queryHelper';

type CompanyKeys = (keyof EntityType<typeof db.company.findMany>)[];

export default requireAuth(async (req, res) => {
  const id = req.query.id;
  const keys = ['name', 'createdBy', 'updatedBy', 'contactName', 'contactNumber'] as CompanyKeys;

  if (typeof id != 'string')
    return res.status(400).json({
      succcess: false,
      message: 'Company id not provided',
    });

  switch (req.method) {
    case 'GET': {
      try {
        const select = fields(req.query.fields as string, keys);
        const result = await db.company.findUnique({ where: { id }, select });

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
        const result = await db.company.update({
          where: { id },
          data: req.body,
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
  }
});
