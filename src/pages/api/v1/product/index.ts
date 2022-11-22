import errorHandler from 'libs/errorHandler';
import QueryHelper, { pagination } from 'libs/queryHelper';

import validator, { createUpdateProduct } from 'validator';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import { product } from 'services';

const handler: CtxWithUser = async (req, res) => {
  const { body, user } = req;
  try {
    switch (req.method) {
      case 'GET': {
        const { paginate, result } = await product.getMany(req.query);

        return res.status(200).json({
          success: true,
          paginate,
          result,
        });
      }

      case 'POST': {
        const isInvalid = await validator(createUpdateProduct, req.body);
        if (isInvalid) return res.status(400).json({ success: false, message: isInvalid });

        const result = await product.createOrUpdate({ body, user });

        return res.status(200).json({
          success: true,
          message: 'Product created',
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
};

export default requireAuth(handler, {
  rule: [{ method: '^((?!GET).)*$', role: ['ADMIN'] }],
});
