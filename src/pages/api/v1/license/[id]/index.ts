import QueryHelper from 'libs/queryHelper';
import errorHandler from 'libs/errorHandler';

import validator, { updateLicense } from 'validator';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import { license } from 'services';

const handler: CtxWithUser = async (req, res) => {
  try {
    const id = req.query.id;
    const { body, user } = req;

    if (typeof id != 'string')
      return res.status(400).json({
        succcess: false,
        message: 'License id not provided',
      });

    const qh = new QueryHelper(req.query);

    switch (req.method) {
      case 'GET': {
        const result = await license.getUnique({ id }, qh.getSelect());

        if (!result)
          return res.status(404).json({
            success: false,
            message: 'License not found',
          });

        return res.status(200).json({
          success: true,
          result,
        });
      }

      case 'PUT': {
        const errMsg = await validator(updateLicense, req.body);
        if (errMsg) return res.status(400).json({ success: false, message: errMsg });

        const { result, error } = await license.update({ id, body, user });

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
  } catch (err: any) {
    const { code, message } = errorHandler(err);
    return res.status(code).json({ success: false, message });
  }
};

export default requireAuth(handler, {
  rule: [{ method: '.*', role: ['ADMIN', 'SUPPORT'] }],
});
