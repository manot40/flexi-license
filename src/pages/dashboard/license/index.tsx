import type { GetServerSideProps } from 'next/types';

import { SWRConfig } from 'swr';
import { license } from 'services';
import { getAuthUser } from 'middleware/requireAuth';

import Content from 'components/license/ContentIndex';

export default function LicenseIndex({ fallback }: { fallback: Res<License[]> }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Content />
    </SWRConfig>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const user = await getAuthUser(req);

  const reqUrl = `/api/v1/license?page=${query.page || 1}&companyId=${query.companyId || ''}&type=${
    query.type || ''
  }:equals`;

  if (!user) {
    res.writeHead(302, { Location: `/login?redirect=${req.url}` });
    res.end();
  } else if (!['ADMIN', 'SUPPORT'].includes(user.role)) {
    res.writeHead(302, { Location: `/dashboard` });
    res.end();
  }

  const _query = { ...query };
  _query.type && (_query.type = `${_query.type}:equals`);

  const { paginate, result } = await license.getMany(_query).catch(() => ({ paginate: null, result: [] }));

  return {
    props: {
      fallback: {
        [reqUrl]: { paginate, result: JSON.parse(JSON.stringify(result)) },
      },
    },
  };
};
