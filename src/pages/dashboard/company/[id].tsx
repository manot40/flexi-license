import type { GetServerSideProps } from 'next';

import { useState } from 'react';

import { company } from 'services';

import { useDisclosure } from '@mantine/hooks';

import { AutoTable } from 'components/reusable';
import { IconCertificate2 } from '@tabler/icons';
import { LicenseForm } from 'components/license';
import { CompanyForm } from 'components/company';
import { Box, Button, Flex, Modal, Space, Title } from '@mantine/core';

type Props = {
  data: Company & { licenses: License[] };
};

export default function CompanyDetail({ data }: Props) {
  const [opened, handler] = useDisclosure(false);

  const [company, setCompany] = useState({ ...data, licenses: undefined });
  const [licenses, setLicenses] = useState(data.licenses);

  const handleLicenseFormClose = (data: License) => {
    setLicenses((prev) => [data, ...prev]);
    handler.close();
  };

  return (
    <Box>
      <Title order={1}>{company.name}</Title>
      <Space h={32} />
      <Flex gap={32} direction={{ base: 'column', lg: 'row' }}>
        <Flex w={{ base: '100%', lg: '30%' }} gap={12} direction="column">
          <Title order={3}>Company Details</Title>
          <CompanyForm
            style={{ width: '100%' }}
            value={company}
            onSubmitted={(data) => setCompany({ ...company, ...data })}
          />
        </Flex>
        <Flex gap={12} direction="column">
          <Box w={'100%'}>
            <Flex justify="space-between">
              <Title order={3}>Company Licenses</Title>
              <Button leftIcon={<IconCertificate2 />} onClick={handler.open}>
                Publish License
              </Button>
            </Flex>
          </Box>
          <AutoTable data={licenses.map((license) => license)} columns={cols} />
        </Flex>
      </Flex>
      <Modal opened={opened} onClose={handler.close} title={`Publish License for ${company.name}`}>
        <LicenseForm companyId={company.id} onSubmitted={handleLicenseFormClose} />
      </Modal>
    </Box>
  );
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
      data: JSON.parse(JSON.stringify(result!)),
    },
  };
};

const cols = [
  {
    key: 'key',
    title: 'License Key',
  },
  {
    key: 'product',
    title: 'Product',
    render: (row: Product) => `${row?.name} (${row?.code})`,
  },
  {
    key: 'maxUser',
    title: 'Max User',
  },
  {
    key: 'type',
    title: 'Type',
  },
  {
    key: 'subscriptionStart',
    title: 'Subscription Start',
    width: 180,
    render: (cell: string) =>
      Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
  },
  {
    key: 'subscriptionEnd',
    title: 'Subscription End',
    width: 180,
    render: (cell: string) =>
      cell ? (
        Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell))
      ) : (
        <i>(on-prem)</i>
      ),
  },

  {
    key: 'updatedAt',
    title: 'Last Update',
    width: 180,
    render: (cell: string) =>
      Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
  },
  {
    key: 'updatedBy',
    title: 'Updated By',
    width: 120,
  },
];
