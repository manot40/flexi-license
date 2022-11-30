import type { NextApiRequestQuery as Query } from 'next/dist/server/api-utils';

import dayjs from 'dayjs';

import db from 'libs/db';
import QueryHelper, { pagination } from 'libs/queryHelper';
import axios from 'libs/axios';

type PrismaLicense = Parameters<typeof db.license.findUnique>[number] & Parameters<typeof db.license.findMany>[number];

type Params = {
  select: PrismaLicense['select'];
  where: PrismaLicense['where'];
  include: PrismaLicense['include'];
};

export async function verifyLicense({ body }: { body: License }) {
  const prev = await db.license.findFirst({
    where: {
      AND: [{ productCode: body.productCode }, { companyId: body.companyId }, { type: body.type }],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (prev) {
    if (body.type === 'ONPREMISE') {
      return 'On-premise License already exists';
    }

    if (body.type === 'CLOUD') {
      const dateDiff = dayjs(prev.subscriptionEnd).diff(new Date(), 'day');
      if (dateDiff > 1) return 'Cloud License not expired yet';
    }
  }

  return null;
}

export async function getMany(query: Query) {
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
}

export async function getUnique(where: Params['where'], select: Params['select']) {
  return await db.license.findUnique({ where, select });
}

export async function create({ body, user }: CreateUpdateParams<License>) {
  const dupliMessage = await verifyLicense({ body });
  if (dupliMessage) return { error: dupliMessage };

  const data = {
    type: body.type,
    maxUser: body.maxUser,
    companyId: body.companyId,
    productCode: body.productCode,
    instanceUrl: body.instanceUrl,
    subscriptionStart: dayjs(body.subscriptionStart).startOf('day').toDate(),
    subscriptionEnd: body.subscriptionEnd ? dayjs(body.subscriptionEnd).endOf('day').toDate() : undefined,
    createdBy: user.username,
    updatedBy: user.username,
    referenceId: '',
  } as License;

  const { flow, error } = await requestLicenseKey(data);

  if (error) return { error };
  else data.referenceId = flow!.id;

  const result = await db.license.create({ data });

  return { result };
}

export async function update({ id, body, user }: CreateUpdateParams<License>) {
  let data = await db.license.findUnique({ where: { id } });

  if (!data) return { error: 'License not found' };

  data = {
    ...data,
    key: null,
    maxUser: body.maxUser,
    companyId: body.companyId,
    productCode: body.productCode,
    instanceUrl: body.instanceUrl,
    updatedBy: user.username,
    updatedAt: new Date(),
  };

  const { flow, error } = await requestLicenseKey(data);

  if (error) return { error };
  data.referenceId = flow!.id;

  const result = await db.license.update({ where: { id }, data });

  return { result };
}

export async function approveLicense({ company, product, key }: { company: string; product: string; key: string }) {
  try {
    const { id } =
      (await db.license.findFirst({
        orderBy: { updatedAt: 'desc' },
        where: { AND: [{ company: { name: company } }, { productCode: product }, { referenceId: { not: null } }] },
      })) || {};

    if (!id) return { error: 'Failed to approve license, please make sure sent data is correct' };

    const result = await db.license.update({
      where: { id },
      data: { key, referenceId: null },
    });

    return { result };
  } catch (err: any) {
    console.error(err.message);
    return { error: 'Internal Server Error' };
  }
}

export async function extendLicense({ id, body, user }: CreateUpdateParams<License>) {
  const license = await db.license.findUnique({ where: { id } });

  if (!license) return { error: 'License not found' };

  if (dayjs(license.subscriptionEnd).isAfter(dayjs(body.subscriptionEnd))) {
    return { error: 'New subscription end date must be greater than current subscription end date' };
  }

  const data = {
    subscriptionEnd: dayjs(body.subscriptionEnd).endOf('day').toDate(),
    updatedBy: user.username,
    key: null,
  } as License;

  const { error, flow } = await requestLicenseKey(license);

  if (error) return { error };
  else data.referenceId = flow!.id;

  const [result] = await Promise.all([
    db.license.update({ where: { id }, data }),
    db.extendedLicense.create({
      data: {
        key: license.key!,
        licenseId: license.id,
        subscriptionEnd: license.subscriptionEnd!,
      },
    }),
  ]);

  return { result };
}

export async function requestLicenseKey(data: License) {
  const { name: companyName } = (await db.company.findUnique({ where: { id: data.companyId } })) || ({} as Company);
  const { name: productName } = (await db.product.findUnique({ where: { code: data.productCode } })) || ({} as Product);

  if (!companyName || !productName) return { error: 'Company or Product not found' };

  try {
    const variables = [
      { name: 'name', value: companyName },
      { name: 'productName', value: data.productCode },
      { name: 'type', value: data.type[0] + data.type.substring(1).toLowerCase() },
      { name: 'maxUser', value: data.maxUser + '' },
      { name: 'approval', value: 'Romi' /*data.updatedBy*/ },
    ];

    if (data.type === 'CLOUD')
      variables.push({ name: 'expiredDate', value: dayjs(data.subscriptionEnd).format('DD-MM-YYYY') });

    const flow = (
      await axios.post<LicenseReqFlow>('/flexiflow-rest/service/runtime/process-instances', {
        processDefinitionKey: 'license-approval',
        variables,
      })
    ).data;

    return { flow };
  } catch (e: any) {
    console.error(e.response?.data || e.message);
    return { error: 'Unable connect to license service' };
  }
}
