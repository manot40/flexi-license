import { useRouter } from 'next/router';

export default function CompanyDetail() {
  const { query } = useRouter();

  return query.id;
}
