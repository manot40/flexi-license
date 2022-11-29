// import type { GetServerSideProps } from 'next/types';

import { Flex, Stack, Title } from '@mantine/core';
// import { getAuthUser } from 'middleware/requireAuth';
import LicenseCheck from 'components/public/LicenseCheck';

export default function Index() {
  return (
    <Flex
      h="100%"
      w="100%"
      gap="xs"
      mih={50}
      align="center"
      justify="center"
      direction="column"
      style={{ position: 'fixed', top: 0, left: 0 }}>
      <Stack spacing={12}>
        <Title order={1} ml={4} size={24}>
          License Check
        </Title>
        <LicenseCheck />
      </Stack>
    </Flex>
  );
}

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
//   const user = await getAuthUser(req);

//   if (user !== null) res.writeHead(302, { Location: `/dashboard` }).end();

//   return {
//     props: {},
//   };
// };
