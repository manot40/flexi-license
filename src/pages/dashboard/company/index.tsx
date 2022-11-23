import type { GetServerSideProps } from 'next/types';

import { SWRConfig } from 'swr';
import { company } from 'services';
import { getAuthUser } from 'middleware/requireAuth';

import Content from 'components/company/ContentIndex';

export default function CompanyIndex({ fallback }: { fallback: Res<Company[]> }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Content />
    </SWRConfig>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const user = await getAuthUser(req);
  const reqUrl = `/api/v1/company?page=${query.page || 1}&name=${query.name || ''}`;

  if (!user) {
    res.writeHead(302, { Location: `/login?redirect=${req.url}` });
    res.end();
  }

  const { paginate, result } = await company.getMany(query);

  return {
    props: {
      fallback: {
        [reqUrl]: { paginate, result: JSON.parse(JSON.stringify(result)) },
      },
    },
  };
};
