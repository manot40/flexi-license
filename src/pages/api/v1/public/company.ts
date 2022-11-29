import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import errorHandler from 'libs/errorHandler';

import { company } from 'services';

const handler = async (req: NextReq, res: NextRes) => {
  try {
    switch (req.method) {
      case 'GET': {
        const { name = '', limit = '5' } = req.query;
        const { paginate, result } = await company.getMany({ name, limit, fields: 'id,name' });

        return res.status(200).json({
          success: true,
          paginate,
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

export default handler;
