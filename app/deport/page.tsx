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
    <main className="w-full max-w-8xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      <div className="flex w-full flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600 leading-relaxed">
          <p>
            Liste der deportierten Personen aus dem Kanton Pallasovka der Autonomen Sozialistischen Sowjetrepublik der Wolgadeutschen (ASSRdW) in die Region Altai (Zug Nr. 858).
            Start des Zuges am 04.09.1941 an der Station Pallasovka; Ankunft des Zuges am 14.09.1941 an der Station Tretjakovo (Третьяково);
            Verteilung der Deportierten im Smeinogorskij Rayon (Змеиногорский pайон); Anzahl der deportierten Personen: 2314.
          </p>
        </div>
      </div>

      <Statistics
        totalPersons={stats.totalPersons}
        totalPages={totalPages}
        maleCount={stats.maleCount}
        femaleCount={stats.femaleCount}
        averageAge={stats.averageAge}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Search placeholder="Suche ..." />
        </div>

        <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
          <Table query={query} currentPage={currentPage} />
        </Suspense>

        <div className="flex w-full justify-center mt-4">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}