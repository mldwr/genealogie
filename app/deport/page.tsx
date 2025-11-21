import Pagination from '@/app/deport/pagination';
import Search from '@/app/deport/search';
import Table from '@/app/deport/table';
import Statistics from '@/app/deport/statistics';
import { lusitana } from '@/app/deport/fonts';
import { InvoicesTableSkeleton } from '@/app/deport/skeletons';
import { Suspense } from 'react';
import { fetchDeportedPages, fetchDeportationStatistics } from '@/app/deport/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'People',
};

export default async function Page(
  props: {
    searchParams?: Promise<{
      query?: string;
      page?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchDeportedPages(query);
  const stats = await fetchDeportationStatistics();

  return (
    <div className="w-full mt-4">
      <div className="flex w-full justify-between p-6 bg-white rounded-xl shadow-md">
        Liste der deportierten Personen aus dem Kanton Pallasovka der Autonomen Sozialistischen Sowjetrepublik der Wolgadeutschen (ASSRdW) in die Region Altai (Zug Nr. 858). Start des Zuges am 04.09.1941 an der Station Pallasovka; Ankunft des Zuges am 14.09.1941 an der Station Tretjakovo (Третьяково); Verteilung der Deportierten im Smeinogorskij Rayon (Змеиногорский pайон); Anzahl der deportierten Personen: 2314.
      </div>
      <div className="mt-4">
        <Statistics
          totalPersons={stats.totalPersons}
          totalPages={totalPages}
          maleCount={stats.maleCount}
          femaleCount={stats.femaleCount}
          averageAge={stats.averageAge}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Suche ..." />
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