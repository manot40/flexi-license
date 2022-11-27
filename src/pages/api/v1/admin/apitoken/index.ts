import errorHandler from 'libs/errorHandler';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import { apiToken } from 'services';

const handler: CtxWithUser = async (req, res) => {
  try {
    switch (req.method) {
      case 'GET': {
        const { result, paginate } = await apiToken.getMany(req.query);

        return res.status(200).json({
          success: true,
          paginate,
          result,
        });
      }

      case 'POST': {
        const { body } = req;
        // const isInvalid = await validator(authenticateUser, req.body);
        // if (isInvalid) return res.status(400).json({ success: false, message: isInvalid });

        const { result, error } = await apiToken.create({ body });

        if (error) return res.status(400).json({ success: false, message: error });

        return res.status(200).json({
          success: true,
          message: 'Token created',
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
  rule: [{ method: '.*', role: 'ADMIN' }],
});
