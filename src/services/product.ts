import type { NextApiRequestQuery as Query } from 'next/dist/server/api-utils';

import db from 'libs/db';
import QueryHelper, { pagination } from 'libs/queryHelper';

type PrismaProduct = Parameters<typeof db.product.findUnique>[number] & Parameters<typeof db.product.findMany>[number];

type Params = {
  select: PrismaProduct['select'];
  where: PrismaProduct['where'];
};

export const getMany = async (query: Query) => {
  const qh = new QueryHelper(query);

  const where = qh.getWhere();
  const count = await db.product.count({ where });
  const { take, skip, ...paginate } = pagination(query, count);

  const result = await db.product.findMany({
    take,
    skip,
    where,
    select: qh.getSelect(),
    orderBy: qh.getOrderBy(),
  });

  return { paginate, result };
};

export const getUnique = async (where: Params['where'], select: Params['select']) => {
  return await db.product.findUnique({ where, select });
};

export const createOrUpdate = async ({ id, body, user }: CreateUpdateParams<Product>) => {
  let product: Product;

  const params: { data: Partial<Product> } = {
    data: {
      name: body.name,
      code: body.code,
      isActive: body.isActive,
      description: body.description,
      updatedBy: user.username,
    },
  };

  if (!id) {
    params.data.createdBy = user.username;
    product = await db.product.create(params as any);
  } else {
    product = await db.product.update({
      where: { id: body.id },
      ...params,
    });
  }

  return product;
};
