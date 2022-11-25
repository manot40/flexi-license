import errorHandler from 'libs/errorHandler';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import { license } from 'services';

const handler: CtxWithUser = async (req, res) => {
  try {
    switch (req.method) {
      case 'POST': {
        const { company, product, key } = req.body;

        if (!company || !product || !key)
          return res.status(400).json({
            success: false,
            message: 'No valid license key, company name, or product code provided',
          });

        const { result, error } = await license.approveLicense({ company, product, key });

        if (!result) return res.status(400).json({ success: false, message: error });

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
