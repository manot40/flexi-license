import type { NextApiRequest as NextReq, NextApiResponse as NextRes } from 'next';

import errorHandler from 'libs/errorHandler';

import db from 'libs/db';

const handler = async (req: NextReq, res: NextRes) => {
  try {
    switch (req.method) {
      case 'GET': {
        const { company = '', productCode = '' } = req.query as { [key: string]: string };

        if (!company || !productCode)
          return res.status(400).json({
            success: false,
            message: 'Company and Product Code are required',
          });

        const result = await db.license.findMany({
          where: { productCode, key: { not: null }, company: { name: company } },
          select: {
            type: true,
            maxUser: true,
            subscriptionStart: true,
            subscriptionEnd: true,
          },
        });

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

export default handler;
