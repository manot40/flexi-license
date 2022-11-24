import errorHandler from 'libs/errorHandler';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import validator, { createLicense } from 'validator';

import { license } from 'services';

const handler: CtxWithUser = async (req, res) => {
  try {
    const referenceId = req.query.id as string;

    switch (req.method) {
      case 'PATCH': {
        const key = req.body.key;

        if (typeof key !== 'string' || key.length < 1)
          return res.status(400).json({
            success: false,
            message: 'No valid license key provided',
          });

        const result = await license.approveLicense({ referenceId, key });

        if (!result)
          return res.status(400).json({
            success: false,
            message: 'Failed to approve license, please make sure the referenceId is correct',
          });

        return res.status(200).json({ success: true, message: 'OK' });
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
  rule: [{ method: '.*', role: ['ADMIN'] }],
});
