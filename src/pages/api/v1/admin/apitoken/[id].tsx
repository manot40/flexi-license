import errorHandler from 'libs/errorHandler';

import requireAuth, { CtxWithUser } from 'middleware/requireAuth';
import { apiToken } from 'services';

const handler: CtxWithUser = async (req, res) => {
  try {
    const id = req.query.id;

    if (typeof id != 'string')
      return res.status(400).json({
        succcess: false,
        message: 'Token id not provided',
      });

    switch (req.method) {
      case 'PATCH': {
        const { isActive } = req.body;

        const { result, error } = await apiToken.revoke({ id, isActive });

        if (error) return res.status(400).json({ success: false, message: error });

        return res.status(200).json({
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
  } catch (err) {
    const { code, message } = errorHandler(err);
    return res.status(code).json({ success: false, message });
  }
};

export default requireAuth(handler, {
  rule: [{ method: '.*', role: 'ADMIN' }],
});
