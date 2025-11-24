'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AgeDistributionData } from '../data';

interface AgeDistributionChartProps {
  data: AgeDistributionData[];
}

// Color palette for bars
const COLORS = [
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#93c5fd', // blue-300
  '#dbeafe', // blue-100
  '#bfdbfe', // blue-200
  '#93c5fd', // blue-300
  '#60a5fa', // blue-400
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
];

export default function AgeDistributionChart({ data }: AgeDistributionChartProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Altersverteilung</h3>
        <p className="text-sm text-gray-500 mt-1">
          Alter der Personen zum Zeitpunkt der Deportation (1941)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="ageRange"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Altersgruppe',
              position: 'insideBottom',
              offset: -10,
              style: { fill: '#6b7280', fontSize: 14 },
            }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Anzahl Personen',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 14 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
            formatter={(value: number) => [`${value} Personen`, 'Anzahl']}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Gesamt</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Altersgruppen</p>
            <p className="text-lg font-semibold text-gray-900">{data.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Häufigste Gruppe</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.reduce((max, item) => (item.count > max.count ? item : max), data[0])?.ageRange || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Max. Anzahl</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.max(...data.map(item => item.count))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

