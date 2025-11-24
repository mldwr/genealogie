'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { FamilyNameStatistic } from '../data';

interface FamilyNameTableProps {
  data: FamilyNameStatistic[];
}

type SortDirection = 'asc' | 'desc';
type SortField = 'familyName' | 'count';

export default function FamilyNameTable({ data }: FamilyNameTableProps) {
  const [sortField, setSortField] = useState<SortField>('count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showAll, setShowAll] = useState(false);

  // Sort data based on current sort settings
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (sortField === 'familyName') {
        return sortDirection === 'asc'
          ? a.familyName.localeCompare(b.familyName)
          : b.familyName.localeCompare(a.familyName);
      } else {
        return sortDirection === 'asc'
          ? a.count - b.count
          : b.count - a.count;
      }
    });

    return showAll ? sorted : sorted.slice(0, 10);
  }, [data, sortField, sortDirection, showAll]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'count' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  const totalPersons = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Familiennamen-Statistik
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Häufigkeit der Familiennamen in der Datenbank
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Eindeutige Namen</p>
          <p className="text-2xl font-bold text-gray-900">{data.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('familyName')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Familienname
                  <SortIcon field="familyName" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('count')}
                  className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors ml-auto"
                >
                  Anzahl
                  <SortIcon field="count" />
                </button>
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">
                Anteil
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const percentage = ((item.count / totalPersons) * 100).toFixed(1);
              return (
                <tr
                  key={item.familyName}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400 w-6">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.familyName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center justify-center min-w-12 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
                      {item.count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-600">
                    {percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showAll ? 'Weniger anzeigen' : `Alle ${data.length} Namen anzeigen`}
          </button>
        </div>
      )}
    </div>
  );
}

