'use client';

import { useEffect, useState } from 'react';
import { lusitana } from '@/app/deport/fonts';

type StatisticsProps = {
  totalPersons: number;
  totalPages: number;
  maleCount?: number;
  femaleCount?: number;
  averageAge?: number;
};

export default function Statistics({
  totalPersons,
  totalPages,
  maleCount,
  femaleCount,
  averageAge,
}: StatisticsProps) {
  return (
    <div className="w-full mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Personen" value={totalPersons} />
        <StatCard title="Seiten" value={totalPages} />
        {maleCount !== undefined && femaleCount !== undefined && (
          <StatCard 
            title="Geschlecht" 
            value={`${maleCount} männlich / ${femaleCount} weiblich`} 
          />
        )}
        {averageAge !== undefined && (
          <StatCard title="Durchschnittsalter" value={averageAge} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-md border">
      <h3 className={`${lusitana.className} text-sm font-medium text-gray-500`}>{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}