'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { PatronymicAnalysisData } from '../types';

interface PatronymicAnalysisChartProps {
  data: PatronymicAnalysisData;
}

// Color palette for the chart
const COLORS = {
  all: '#8b5cf6',       // violet-500
  male: '#3b82f6',      // blue-500
  female: '#ec4899',    // pink-500
  barGradient: [
    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
    '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa',
  ],
};

type GenderFilter = 'all' | 'male' | 'female';

export default function PatronymicAnalysisChart({ data }: PatronymicAnalysisChartProps) {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [showCount, setShowCount] = useState(15);

  // Filter and prepare data based on gender selection
  const chartData = useMemo(() => {
    const filtered = data.patronymics.map((p) => ({
      name: p.name,
      count: genderFilter === 'all' ? p.count 
           : genderFilter === 'male' ? p.maleCount 
           : p.femaleCount,
      maleCount: p.maleCount,
      femaleCount: p.femaleCount,
      total: p.count,
    }))
    .filter((p) => p.count > 0) // Remove zero-count entries after filtering
    .sort((a, b) => b.count - a.count)
    .slice(0, showCount);

    return filtered;
  }, [data.patronymics, genderFilter, showCount]);

  // Calculate statistics for the filtered view
  const stats = useMemo(() => {
    const totalInView = chartData.reduce((sum, p) => sum + p.count, 0);
    const topPatronymic = chartData[0];
    return {
      totalInView,
      topName: topPatronymic?.name || '-',
      topCount: topPatronymic?.count || 0,
      displayedCount: chartData.length,
    };
  }, [chartData]);

  // Empty state
  if (data.patronymics.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patronym-Analyse (Vatersname)</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Keine Patronym-Daten verfügbar</p>
          </div>
        </div>
      </div>
    );
  }

  const getBarColor = () => {
    switch (genderFilter) {
      case 'male': return COLORS.male;
      case 'female': return COLORS.female;
      default: return COLORS.all;
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Patronym-Analyse (Vatersname)</h3>
            <p className="text-sm text-gray-500 mt-1">
              Häufigkeit der Vatersnamen – kultureller Einblick in Namenskonventionen
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Gender filter toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  genderFilter === 'all'
                    ? 'bg-white shadow text-violet-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  genderFilter === 'male'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Männlich
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  genderFilter === 'female'
                    ? 'bg-white shadow text-pink-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Weiblich
              </button>
            </div>

            {/* Show count selector */}
            <select
              value={showCount}
              onChange={(e) => setShowCount(Number(e.target.value))}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 border-none focus:ring-2 focus:ring-violet-500"
            >
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
              <option value={30}>Top 30</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getBarColor() }}
          />
          <span>
            {genderFilter === 'all' ? 'Alle Personen'
              : genderFilter === 'male' ? 'Männliche Personen'
              : 'Weibliche Personen'}
          </span>
        </div>
        <div className="text-gray-500">
          Balkenbreite = Häufigkeit des Vatersnamens
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 28)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Anzahl Personen',
              position: 'insideBottom',
              offset: -5,
              style: { fill: '#6b7280', fontSize: 12 },
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#374151', fontSize: 12 }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
            formatter={(value: number, _name: string, props: { payload?: { total: number; maleCount: number; femaleCount: number } }) => {
              const payload = props.payload;
              return [
                <div key="tooltip" className="space-y-1">
                  <div><strong>Gesamt:</strong> {payload?.total} Personen</div>
                  <div><strong>Männlich:</strong> {payload?.maleCount}</div>
                  <div><strong>Weiblich:</strong> {payload?.femaleCount}</div>
                </div>
              ];
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={800}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor()}
                fillOpacity={1 - (index * 0.03)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Eindeutige Patronyme</p>
            <p className="text-lg font-semibold text-gray-900">{data.uniquePatronymics}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Erfasste Personen</p>
            <p className="text-lg font-semibold text-gray-900">{data.totalPersons}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Häufigster Vatersname</p>
            <p className="text-lg font-semibold text-gray-900 truncate" title={stats.topName}>
              {stats.topName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Max. Häufigkeit</p>
            <p className="text-lg font-semibold text-gray-900">{stats.topCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

