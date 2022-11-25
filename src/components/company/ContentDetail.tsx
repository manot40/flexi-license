import { useState } from 'react';
import { useAuth } from 'components/AuthContext';
import { useDisclosure } from '@mantine/hooks';

import { IconCertificate2 } from '@tabler/icons';
import { LicenseForm } from 'components/license';
import { CompanyForm } from 'components/company';
import { AutoTable, Result } from 'components/reusable';
import { Stack, Button, Flex, Modal, Space, Title, Card } from '@mantine/core';

type Props = {
  data?: Company & { licenses: License[] };
};

export default function ContentDetail({ data }: Props) {
  const { checkRole } = useAuth();
  const [opened, handler] = useDisclosure(false);
  const [company, setCompany] = useState({ ...data, licenses: undefined });
  const [licenses, setLicenses] = useState(data?.licenses || []);

  if (!data) return <Result type="404" />;

  const isSales = checkRole('SALES');

  const handleLicenseFormClose = (data: License) => {
    setLicenses((prev) => [data, ...prev]);
    handler.close();
  };

  return (
    <Stack spacing={24}>
      <Title order={1}>{company.name}</Title>
      <Flex gap={32} direction={{ base: 'column', lg: 'row' }}>
        <Flex w={{ base: '100%', lg: '30%' }} gap={12} direction="column">
          <Title order={3}>Company Details</Title>
          <Card shadow="sm" radius="md" p="lg">
            <CompanyForm
              style={{ width: '100%' }}
              value={company}
              onSubmitted={(data) => setCompany({ ...company, ...data })}
            />
          </Card>
        </Flex>
        <Stack spacing={12}>
          <Flex justify="space-between">
            <Title order={3}>Company Licenses</Title>
            {isSales && (
              <Button leftIcon={<IconCertificate2 size={20} />} onClick={handler.open}>
                New License
              </Button>
            )}
          </Flex>
          <Card shadow="sm" radius="md" p="lg">
            <AutoTable data={licenses.map((license) => license)} columns={cols} />
          </Card>
        </Stack>
      </Flex>
      {isSales && (
        <Modal opened={opened} onClose={handler.close} title={`Request License for ${company.name}`}>
          <LicenseForm companyId={company.id} onSubmitted={handleLicenseFormClose} />
        </Modal>
      )}
    </Stack>
  );
}

const cols = [
  {
    key: 'key',
    title: 'License Key',
    render: (val?: string) => val || <i style={{ opacity: 0.5 }}>(pending approval)</i>,
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
