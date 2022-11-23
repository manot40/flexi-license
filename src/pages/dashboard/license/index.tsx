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

  const reqUrl = `/api/v1/license?page=${query.page || 1}&companyId=${query.search || ''}&type=${
    query.type || ''
  }:equals`;

  if (!user) {
    res.writeHead(302, { Location: `/login?redirect=${req.url}` });
    res.end();
  }

  const { paginate, result } = await license.getMany(query);

  return {
    props: {
      fallback: {
        [reqUrl]: { paginate, result: JSON.parse(JSON.stringify(result)) },
      },
    },
  };
};
