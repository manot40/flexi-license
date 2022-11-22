import db from 'libs/db';
import requireAuth from 'libs/requireAuth';
import errorHandler from 'libs/errorHandler';
import validator, { createUpdateProduct } from 'validator';
import QueryHelper, { pagination } from 'libs/queryHelper';

export default requireAuth(
  async (req, res) => {
    try {
      switch (req.method) {
        case 'GET': {
          const qh = new QueryHelper(req.query);

          const where = qh.getWhere();
          const count = await db.product.count({ where });
          const { take, skip, ...paginate } = pagination(req.query, count);

          const result = await db.product.findMany({
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
          const isInvalid = await validator(createUpdateProduct, req.body);
          if (isInvalid) return res.status(400).json({ success: false, message: isInvalid });

          const result = await db.product.create({
            data: {
              code: req.body.code,
              name: req.body.name,
              description: req.body.description,
              isActive: req.body.isActive,
              createdBy: req.user.username,
              updatedBy: req.user.username,
            },
          });

          return res.status(200).json({
            success: true,
            message: 'product created',
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
      return res.status(code).json({
        success: false,
        message,
      });
    }
  },
  {
    allowRule: [{ method: '^((?!GET).)*$', role: ['ADMIN'] }],
  }
);
