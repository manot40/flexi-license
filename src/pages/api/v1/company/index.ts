import errorHandler from 'libs/errorHandler';

import validator, { createUpdateCompany } from 'validator';

import requireAuth, { type CtxWithUser } from 'middleware/requireAuth';

import { company } from 'services';

const handler: CtxWithUser = async (req, res) => {
  try {
    const { body, user } = req;

    const allowedRoles = ['ADMIN', 'SALES'];

    if (req.method != 'GET' && !allowedRoles.includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this resource',
      });

    switch (req.method) {
      case 'GET': {
        const { paginate, result } = await company.getMany(req.query);

        return res.status(200).json({
          success: true,
          paginate,
          result,
        });
      }

      case 'POST': {
        const errMsg = await validator(createUpdateCompany, req.body);
        if (errMsg) return res.status(400).json({ success: false, message: errMsg });

        const result = await company.createOrUpdate({ body, user });

        return res.status(201).json({
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
  rule: [{ method: '^((?!GET).)*$', role: ['ADMIN', 'SALES'] }],
});
