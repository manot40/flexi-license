import type { NextApiRequestQuery as Query } from 'next/dist/server/api-utils';

import db from 'libs/db';
import QueryHelper, { pagination } from 'libs/queryHelper';

type PrismaCompany = Parameters<typeof db.company.findUnique>[number] & Parameters<typeof db.company.findMany>[number];

type Params = {
  select: PrismaCompany['select'];
  where: PrismaCompany['where'];
};

export const getMany = async (query: Query) => {
  const qh = new QueryHelper(query);

  const where = qh.getWhere();
  const count = await db.company.count({ where });
  const { take, skip, ...paginate } = pagination(query, count);

  const result = await db.company.findMany({
    take,
    skip,
    where,
    select: qh.getSelect(),
    orderBy: qh.getOrderBy(),
  });

  return { paginate, result };
};

export const getUnique = async (where: Params['where'], select: Params['select']) => {
  return await db.company.findUnique({ where, select });
};

export const createOrUpdate = async ({ id, body, user }: CreateUpdateParams<Company>) => {
  let company: Company;

  const params: { data: Partial<Company> } = {
    data: {
      name: body.name,
      contactName: body.contactName,
      contactNumber: body.contactNumber,
      updatedBy: user.username,
    },
  };

  if (!id) {
    params.data.createdBy = user.username;
    company = await db.company.create(params as any);
  } else {
    company = await db.company.update({
      where: { id: body.id },
      ...params,
    });
  }

  return company;
};
