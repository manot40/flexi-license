import { useState } from 'react';
import { useAuth } from 'components/AuthContext';
import { useDisclosure } from '@mantine/hooks';

import { LicenseForm } from 'components/license';
import { CompanyForm } from 'components/company';
import { AutoTable, Result } from 'components/reusable';
import { IconCertificate2, IconFileDownload } from '@tabler/icons';
import { Stack, Button, Flex, Modal, Title, Card, PasswordInput, ActionIcon, Group } from '@mantine/core';

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
    style: { minWidth: 200 },
    render: (val: string | null, { id }: License) =>
      val ? (
        <Group spacing={2}>
          <PasswordInput
            readOnly
            miw="calc(100% - 32px)"
            value={val}
            styles={{ input: { border: 0 } }}
            onFocus={(e) => e.target.select()}
          />
          <ActionIcon component="span" color="blue" onClick={() => window.open(`/api/v1/license/${id}/download`)}>
            <IconFileDownload size={20} stroke={1.4} />
          </ActionIcon>
        </Group>
      ) : (
        <i style={{ opacity: 0.5 }}>(pending approval)</i>
      ),
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
    style: { width: 180 },
    render: (cell: string) =>
      Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
  },
  {
    key: 'subscriptionEnd',
    title: 'Subscription End',
    style: { width: 180 },
    render: (cell: string) =>
      cell ? (
        Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell))
      ) : (
        <i>(on-prem)</i>
      ),
  },
  {
    key: 'instanceUrl',
    title: 'Instance',
    //style: { width: 180 }
  },
  {
    key: 'updatedAt',
    title: 'Last Update',
    style: { width: 180 },
    render: (cell: string, row: Company) =>
      `${Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell))} (${
        row.updatedBy
      })`,
  },
];
