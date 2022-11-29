import { useState, useEffect } from 'react';

import Result from './result';
import { Card, Flex, Stack } from '@mantine/core';
import { CompanySelect, ProductSelect } from 'components/reusable';

const LicenseCheck = () => {
  const [company, setCompany] = useState<Company>();
  const [product, setProduct] = useState<Product>();
  const [licenses, setLicenses] = useState<License[] | null>(null);

  useEffect(() => {
    if (company && product)
      (async () => {
        const res = await fetch(
          `/api/v1/public/check-license?companyId=${company.id}&productCode=${product.code}`
        ).then((r) => r.json());

        if (Array.isArray(res?.result)) setLicenses(res.result);
        else setLicenses(null);
      })();
  }, [company, product]);

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
          <CompanySelect
            value={company?.id}
            label="Company Name"
            placeholder="Search company"
            url="/api/v1/public/company"
            onChange={(_, c) => setCompany(c)}
          />
        </Flex>
        <Result product={product!} licenses={licenses} />
      </Stack>
    </Card>
  );
};

export default LicenseCheck;
