import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import QueryHelper, { pagination } from 'libs/queryHelper';

type CompanyKeys = (keyof EntityType<typeof db.company.findMany>)[];

export default requireAuth(async (req, res) => {
  switch (req.method) {
    case 'GET': {
      try {
        const count = await db.company.count();
        const { take, skip, ...paginate } = pagination(req.query, count);

        const query = new QueryHelper(req.query, [
          'name',
          'createdBy',
          'updatedBy',
          'contactName',
          'contactNumber',
        ] as CompanyKeys);

        const result = await db.company.findMany({
          take,
          skip,
          where: query.getWhere(),
          select: query.getSelect(),
          orderBy: query.getOrderBy(),
        });

        if (!result.length)
          return res.status(404).json({
            success: false,
            message: 'No company found with this criteria',
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
  }
});
