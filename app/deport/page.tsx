import Pagination from '@/app/deport/pagination';
import Search from '@/app/deport/search';
import Table from '@/app/deport/table';
import { lusitana } from '@/app/deport/fonts';
import { InvoicesTableSkeleton } from '@/app/deport/skeletons';
import { Suspense } from 'react';
import { fetchDeportedPages } from '@/app/deport/data';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'People',
};
 
//export default async function Page() {
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

    const supabase = createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

  return (
    <div className="w-full">
      {/* <div className="flex w-full justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Deportierte
        </h1>
      </div> */}
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Suche ..." />
        {/* <CreateInvoice /> */}
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} authUser={user}/>
      </Suspense> 
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}