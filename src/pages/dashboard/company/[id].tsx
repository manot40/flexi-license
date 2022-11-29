import type { GetServerSideProps } from 'next';

import { company } from 'services';

import Content from 'components/company/ContentDetail';

type Props = {
  data?: Company & { licenses: License[] };
};

export default function CompanyDetail({ data }: Props) {
  return <Content data={data} />;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params!.id as string;

  const result = await company.getUnique(
    { id },
    {
      licenses: {
        select: {
          id: true,
          key: true,
          type: true,
          maxUser: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          instanceUrl: true,
          updatedAt: true,
          updatedBy: true,
          product: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    }
  );

  return {
    props: {
      data: JSON.parse(JSON.stringify(result)),
    },
  };
};
