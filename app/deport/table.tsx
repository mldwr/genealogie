import TableClient from './TableClient';
import { fetchDeported } from '@/app/deport/data';

export default async function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const people = await fetchDeported(query, currentPage);
  
  return <TableClient people={people} />;
}