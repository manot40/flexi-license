import errorHandler from 'libs/errorHandler';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import db from 'libs/db';

const handler: CtxWithUser = async (req, res) => {
  const id = req.query.id as string;
  try {
    switch (req.method) {
      case 'GET': {
        const result = await db.license.findUnique({
          where: { id },
          select: {
            key: true,
            productCode: true,
            company: { select: { name: true } },
          },
        });

        if (!result) return res.status(404).json({ success: false, message: 'License not found' });
        if (!result.key) return res.status(400).json({ success: false, message: 'License key not approved yet' });

        const licenseFile = Buffer.from(`name=${result.company.name}\nkey=${result.key}`);
        const companyTrimmed = result.company.name.replace(/\s/g, '');

        return res
          .setHeader('Content-Disposition', `attachment; filename="${companyTrimmed}-${result.productCode}.ini"`)
          .setHeader('Content-Type', 'text/plain')
          .send(licenseFile);
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
