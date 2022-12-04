import { useState, useEffect, useCallback } from 'react';

import { debounce } from 'utils';

import Result from './result';
import { ProductSelect } from 'components/reusable';
import { Card, Flex, Stack, TextInput } from '@mantine/core';

const LicenseCheck = () => {
  const [company, setCompany] = useState('');
  const [product, setProduct] = useState<Product>();
  const [licenses, setLicenses] = useState<License[] | null>(null);

  // eslint-disable-next-line
  const fetchLicenses = useCallback(
    debounce(async (company, product) => {
      const res = await fetch(`/api/v1/public/check-license?company=${company}&productCode=${product}`).then((r) =>
        r.json()
      );

      if (Array.isArray(res?.result)) setLicenses(res.result);
      else setLicenses(null);
    }, 300),
    []
  );

  useEffect(() => {
    if (company && product) fetchLicenses(company, product.code);
  }, [company, product, fetchLicenses]);

  return (
    <Card p="lg" shadow="md" radius="md" maw="90vw">
      <Stack spacing="sm">
        <Flex direction={{ base: 'column', xs: 'row' }} gap={12}>
          <ProductSelect
            hideCode
            value={product?.id}
            label="Product Name"
            placeholder="Search product"
            url="/api/v1/public/product"
            onChange={(_, p) => setProduct(p)}
          />
          <TextInput
            value={company}
            label="Company Name"
            placeholder="Acme. Inc."
            onChange={(e) => setCompany(e.target.value)}
          />
        </Flex>
        <Result product={product!} licenses={licenses} />
      </Stack>
    </Card>
  );
};

export default LicenseCheck;
