import type { GetServerSideProps } from 'next/types';

import { SWRConfig } from 'swr';
import { product } from 'services';
import { getAuthUser } from 'middleware/requireAuth';

import Content from 'components/product/ContentIndex';

export default function ProductIndex({ fallback }: { fallback: Res<Product[]> }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Content />
    </SWRConfig>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const user = await getAuthUser(req);
  const reqUrl = `/api/v1/product?page=${query.page || 1}&name=${query.name || ''}&isActive=${
    query.status || ''
  }:equals`;

  if (!user) {
    res.writeHead(302, { Location: `/login?redirect=${req.url}` });
    res.end();
  } else if (user.role !== 'ADMIN') {
    res.writeHead(302, { Location: `/dashboard` });
    res.end();
  }

  const _query = { ...query };
  _query.isActive && (_query.isActive = `${_query.isActive}:equals`);

  const { paginate, result } = await product.getMany(_query).catch(() => ({ paginate: null, result: [] }));

  return {
    props: {
      fallback: {
        [reqUrl]: { paginate, result: JSON.parse(JSON.stringify(result)) },
      },
    },
  };
};
