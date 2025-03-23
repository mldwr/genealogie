import Pagination from '@/app/deport/pagination';
import Search from '@/app/deport/search';
import Table from '@/app/deport/table';
import { lusitana } from '@/app/deport/fonts';
import { InvoicesTableSkeleton } from '@/app/deport/skeletons';
import { Suspense } from 'react';
import { fetchDeportedPages } from '@/app/deport/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'People',
};
 
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchDeportedPages(query, currentPage);

  return (
    <div className="w-full mt-4">
      <div className="flex w-full justify-between border p-6 bg-white rounded-xl shadow-md">
        Liste der deportierten Personen aus dem Kanton Pallasovka der Autonomen Sozialistischen Sowjetrepublik der Wolgadeutschen (ASSRdW) in die Region Altai (Zug Nr. 858).
        Beginn der Deportation am 04.09.1941 an der Station Pallasovka; Ende der Deportation am 14.09.1941 an der StationTretjakovo (Третьяково); Anzahl Personen: 2314.
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Suche ..." />
        {/* <CreateInvoice /> */}
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense> 
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}