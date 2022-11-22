import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import errorHandler from 'libs/errorHandler';
import validator, { createUpdateCompany } from 'validator';
import QueryHelper, { pagination } from 'libs/queryHelper';

export default requireAuth(
  async (req, res) => {
    try {
      const allowedRoles = ['ADMIN', 'SALES'];

      if (req.method != 'GET' && !allowedRoles.includes(req.user.role))
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to access this resource',
        });

      switch (req.method) {
        case 'GET': {
          const qh = new QueryHelper(req.query);

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
        }

        case 'POST': {
          const errMsg = await validator(createUpdateCompany, req.body);
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
        }

        default:
          return res.status(405).json({
            success: false,
            message: 'Method not allowed',
          });
      }
    } catch (err: any) {
      const { code, message } = errorHandler(err);
      return res.status(code).json({ success: false, message });
    }
  },
  {
    allowRule: [{ method: '^((?!GET).)*$', role: ['ADMIN', 'SALES'] }],
  }
);
