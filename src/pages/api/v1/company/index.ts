import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
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

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
});
