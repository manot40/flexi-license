import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import validator, { createCompany } from 'libs/validator';
import QueryHelper, { pagination } from 'libs/queryHelper';

type CompanyKey = keyof EntityType<typeof db.company.findMany>;

export const keys = ['name', 'createdBy', 'updatedBy', 'contactName', 'contactNumber'] as CompanyKey[];

export default requireAuth(async (req, res) => {
  switch (req.method) {
    case 'GET': {
      try {
        const query = new QueryHelper(req.query, keys);

        const where = query.getWhere();
        const count = await db.company.count({ where });
        const { take, skip, ...paginate } = pagination(req.query, count);

        const result = await db.company.findMany({
          take,
          skip,
          where,
          select: query.getSelect(),
          orderBy: query.getOrderBy(),
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
});
