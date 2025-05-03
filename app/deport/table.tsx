'use client';

import TableClient from './TableClient';
import { fetchDeported } from '@/app/deport/data';
import { useState, useEffect } from 'react';
import { Deported } from '@/app/deport/definitions';

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [people, setPeople] = useState<Deported[]>([]);

  const fetchData = async () => {
    const fetchedPeople = await fetchDeported(query, currentPage);
    setPeople(fetchedPeople);
  };

  useEffect(() => {
    fetchData();
  }, [query, currentPage]);

  return <TableClient people={people} query={query} currentPage={currentPage} />;
}