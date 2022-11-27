import type { NextApiRequestQuery as Query } from 'next/dist/server/api-utils';

import db from 'libs/db';
import { sign } from './jwt';
import QueryHelper, { pagination } from 'libs/queryHelper';

type PrismaApiToken = Parameters<typeof db.apiToken.findUnique>[number] &
  Parameters<typeof db.apiToken.findMany>[number];

type Params = {
  select: PrismaApiToken['select'];
  where: PrismaApiToken['where'];
};

export const getMany = async (query: Query) => {
  const qh = new QueryHelper(query);

  const where = qh.getWhere();
  const count = await db.apiToken.count({ where });
  const { take, skip, ...paginate } = pagination(query, count);

  const result = await db.apiToken.findMany({
    take,
    skip,
    where,
    select: qh.getSelect(),
    orderBy: qh.getOrderBy(),
  });

  return { paginate, result };
};

export const getUnique = async (where: Params['where']) => {
  return await db.apiToken.findUnique({ where });
};

export const create = async ({ body }: Omit<CreateUpdateParams<ApiToken>, 'user'>) => {
  const userSelect = {
    id: true,
    role: true,
    username: true,
    isActive: true,
  };

  const user = await db.user.findUnique({ where: { username: body.username }, select: userSelect });

  if (!user) return { error: 'Specified user not found!' };

  const token = await sign({ ...user, type: 'API_TOKEN' }, { exp: null });

  const params = {
    data: {
      token,
      username: body.username,
      isActive: body.isActive,
    },
  } as { data: ApiToken };

  const result = await db.apiToken.create({
    ...params,
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  return { result };
};

export const revoke = async ({ id, isActive }: { id?: string; isActive: boolean }) => {
  if (!id) return { error: 'Id is required' };

  const result = await db.apiToken.update({ where: { id }, data: { isActive } });

  return { result };
};

export const remove = async (id: string) => {
  return await db.apiToken.delete({ where: { id } });
};
