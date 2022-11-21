import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import validator, { createCompany } from 'libs/validator';
import QueryHelper, { pagination } from 'libs/queryHelper';

export const keys = [
  'id',
  'name',
  'contactName',
  'contactNumber',
  'updatedAt',
  'createdAt',
  'updatedBy',
  'createdBy',
] as (keyof Company)[];

export default requireAuth(
  async (req, res) => {
    const allowedRoles = ['ADMIN', 'SALES'];

    if (req.method != 'GET' && !allowedRoles.includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this resource',
      });

    switch (req.method) {
      case 'GET': {
        try {
          const qh = new QueryHelper(req.query, keys);

          const where = qh.getWhere();
          const count = await db.company.count({ where });
          const { take, skip, ...paginate } = pagination(req.query, count);

          const result = await db.company.findMany({
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
        } catch (err: any) {
          console.error(err.message);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
          });
        }
      }

      case 'POST': {
        try {
          const errMsg = await validator(createCompany, req.body);
          if (errMsg) return res.status(400).json({ success: false, message: errMsg });

          const result = await db.company.create({
            data: {
              ...req.body,
              createdBy: req.user.username,
              updatedBy: req.user.username,
            },
          });

          return res.status(201).json({
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
  },
  {
    allowRule: [{ method: '^((?!GET).)*$', role: ['ADMIN', 'SALES'] }],
  }
);
