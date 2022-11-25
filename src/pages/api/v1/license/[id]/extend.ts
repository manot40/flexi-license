import errorHandler from 'libs/errorHandler';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import validator, { extendLicense } from 'validator';

import { license } from 'services';

const handler: CtxWithUser = async (req, res) => {
  const body = req.body;
  const id = req.query.id as string;
  const user = req.user;
  try {
    switch (req.method) {
      case 'PATCH': {
        const errMsg = await validator(extendLicense, req.body);
        if (errMsg) return res.status(400).json({ success: false, message: errMsg });

        const { error, result } = await license.extendLicense({ id, body, user });

        if (error) return res.status(400).json({ success: false, message: error });

        return res.status(200).json({ success: true, result });
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
