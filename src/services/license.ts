import type { NextApiRequestQuery as Query } from 'next/dist/server/api-utils';

import dayjs from 'dayjs';

import db from 'libs/db';
import QueryHelper, { pagination } from 'libs/queryHelper';

type PrismaLicense = Parameters<typeof db.license.findUnique>[number] & Parameters<typeof db.license.findMany>[number];

type Params = {
  select: PrismaLicense['select'];
  where: PrismaLicense['where'];
  include: PrismaLicense['include'];
};

export const getMany = async (query: Query) => {
  const qh = new QueryHelper(query);

  let include: Params['include'];
  const where = qh.getWhere() as Params['where'];
  const select = qh.getSelect() as Params['select'];
  const count = await db.license.count({ where });
  const { take, skip, ...paginate } = pagination(query, count);

  if (!select) {
    include = {
      company: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, code: true } },
    };
  } else {
    select.company = { select: { id: true, name: true } };
    select.product = { select: { id: true, name: true, code: true } };
  }

  const result = await db.license.findMany(
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

  return { paginate, result };
};

export const getUnique = async (where: Params['where'], select: Params['select']) => {
  return await db.license.findUnique({ where, select });
};

export const create = async ({ id, body, user }: CreateUpdateParams<License>) => {
  // Check if license already exists
  const prev = await db.license.findFirst({
    where: {
      AND: [{ productCode: body.productCode }, { companyId: body.companyId }, { type: body.type }],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (prev) {
    if (body.type === 'ONPREMISE') {
      return { error: 'On-premise License already exists' };
    }

    if (body.type === 'CLOUD') {
      const dateDiff = dayjs(prev.subscriptionEnd).diff(new Date(), 'day');
      if (dateDiff > 1) return { error: 'Cloud License not expired yet' };
    }
  }

  const result = await db.license.create({
    data: {
      key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      type: body.type,
      maxUser: body.maxUser,
      companyId: body.companyId,
      productCode: body.productCode,
      subscriptionStart: dayjs(body.subscriptionStart).startOf('day').toDate(),
      subscriptionEnd: body.subscriptionEnd ? dayjs(body.subscriptionEnd).endOf('day').toDate() : undefined,
      createdBy: user.username,
      updatedBy: user.username,
    },
  });

  return { result };
};
