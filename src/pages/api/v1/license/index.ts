import db from 'libs/db';

import dayjs from 'dayjs';

import requireAuth from 'libs/requireAuth';
import errorHandler from 'libs/errorHandler';
import validator, { createUpdateLicense } from 'validator';
import QueryHelper, { pagination } from 'libs/queryHelper';

export default requireAuth(
  async (req, res) => {
    try {
      const allowedRoles = ['ADMIN', 'SALES'];

      if (req.method != 'GET' && !allowedRoles.includes(req.user.role))
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to access this resource',
        });

      switch (req.method) {
        case 'GET': {
          const qh = new QueryHelper(req.query);

          let include: any;
          const where = qh.getWhere();
          const select = qh.getSelect();
          const count = await db.license.count({ where });
          const { take, skip, ...paginate } = pagination(req.query, count);

          if (!select) {
            include = {
              company: { select: { id: true, name: true } },
              product: { select: { id: true, name: true, code: true } },
            };
          } else {
            select.company = { select: { id: true, name: true } };
            select.product = { select: { id: true, name: true, code: true } };
          }

          const result: any = await db.license.findMany(
            //@ts-ignore
            {
              take,
              skip,
              where,
              select,
              include,
              orderBy: qh.getOrderBy(),
            }
          );

          return res.status(200).json({
            success: true,
            paginate,
            result,
          });
        }

        case 'POST': {
          const errMsg = await validator(createUpdateLicense, req.body);
          if (errMsg) return res.status(400).json({ success: false, message: errMsg });

          // Check if license already exists
          const prev = await db.license.findFirst({
            where: {
              AND: [{ productCode: req.body.productCode }, { companyId: req.body.companyId }, { type: req.body.type }],
            },
            orderBy: { createdAt: 'desc' },
          });

          if (prev) {
            if (req.body.type === 'ONPREMISE') {
              return res.status(400).json({
                success: false,
                message: 'On-premise License already exists',
              });
            }

            if (req.body.type === 'CLOUD') {
              const dateDiff = dayjs(prev.subscriptionEnd).diff(new Date(), 'day');
              if (dateDiff > 1) {
                return res.status(400).json({
                  success: false,
                  message: 'Cloud License not expired yet',
                });
              }
            }
          }

          const result = await db.license.create({
            data: {
              ...req.body,
              key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              subscriptionStart: dayjs(req.body.subscriptionStart).startOf('day').toDate(),
              subscriptionEnd: req.body.subscriptionEnd
                ? dayjs(req.body.subscriptionEnd).endOf('day').toDate()
                : undefined,
              createdBy: req.user.username,
              updatedBy: req.user.username,
            },
          });

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
  },
  {
    allowRule: [{ method: '^((?!GET).)*$', role: ['ADMIN', 'SALES'] }],
  }
);
