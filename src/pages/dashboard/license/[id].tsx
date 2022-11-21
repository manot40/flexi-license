import { useRouter } from 'next/router';

export default function LicenseDetail() {
  const { query } = useRouter();

  return query.id;
}
