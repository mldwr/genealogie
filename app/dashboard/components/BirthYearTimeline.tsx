'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BirthYearTimelineData, HISTORICAL_EVENTS } from '../types';

interface BirthYearTimelineProps {
  data: BirthYearTimelineData[];
}

// Color scheme consistent with dashboard theme
const CHART_COLORS = {
  areaFill: '#3b82f6',     // blue-500
  areaStroke: '#2563eb',   // blue-600
  gradient1: '#3b82f6',    // blue-500
  gradient2: '#dbeafe',    // blue-100
  referenceLine: '#f97316', // orange-500
  referenceText: '#c2410c', // orange-700
};

/**
 * CustomTooltip: Custom tooltip component for the area chart.
 * Displays period, birth count, and percentage of total.
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BirthYearTimelineData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
      <p className="font-semibold text-gray-900 mb-1">Zeitraum: {data.period}</p>
      <p className="text-blue-600 font-medium">
        Geburten: <span className="text-lg">{data.count}</span>
      </p>
      {data.percentage !== undefined && (
        <p className="text-gray-500 text-sm mt-1">
          {data.percentage.toFixed(1)}% aller Geburten
        </p>
      )}
    </div>
  );
}

export default function BirthYearTimeline({ data }: BirthYearTimelineProps) {
  // Calculate percentages and filter historical events to data range
  const { chartData, totalBirths, relevantEvents, stats } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    // Add percentage to each data point
    const withPercentage = data.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));

    // Filter historical events to only those within the data range
    const minYear = data.length > 0 ? data[0].startYear : 0;
    const maxYear = data.length > 0 ? data[data.length - 1].startYear + 4 : 0;
    
    const events = HISTORICAL_EVENTS.filter(
      (event) => event.year >= minYear && event.year <= maxYear
    );

    // Calculate statistics
    const peakPeriod = data.reduce((max, item) => 
      item.count > max.count ? item : max, data[0]
    );
    const averageBirths = total / (data.length || 1);

    return {
      chartData: withPercentage,
      totalBirths: total,
      relevantEvents: events,
      stats: {
        peakPeriod: peakPeriod?.period || '-',
        peakCount: peakPeriod?.count || 0,
        averageBirths: Math.round(averageBirths * 10) / 10,
        timeSpan: data.length > 0 
          ? `${data[0].startYear} - ${data[data.length - 1].startYear + 4}` 
          : '-',
      },
    };
  }, [data]);

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Geburten im Zeitverlauf</h3>
          <p className="text-sm text-gray-500 mt-1">
            Geburtsjahre der deportierten Personen
          </p>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Keine Geburtsdaten verfügbar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Geburten im Zeitverlauf</h3>
        <p className="text-sm text-gray-500 mt-1">
          Geburtsjahre nach 5-Jahres-Intervallen ({stats.timeSpan})
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
        >
          <defs>
            <linearGradient id="birthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.gradient1} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CHART_COLORS.gradient2} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
            label={{
              value: 'Zeitraum',
              position: 'insideBottom',
              offset: -15,
              style: { fill: '#6b7280', fontSize: 14 },
            }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Anzahl Geburten',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 14 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Historical event reference lines */}
          {relevantEvents.map((event) => (
            <ReferenceLine
              key={event.year}
              x={`${Math.floor(event.year / 5) * 5}-${Math.floor(event.year / 5) * 5 + 4}`}
              stroke={CHART_COLORS.referenceLine}
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: event.label,
                position: 'top',
                fill: CHART_COLORS.referenceText,
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          ))}
          
          <Area
            type="monotone"
            dataKey="count"
            stroke={CHART_COLORS.areaStroke}
            strokeWidth={2}
            fill="url(#birthGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Historical Events Legend */}
      {relevantEvents.length > 0 && (
        <div className="mt-4 mb-2">
          <p className="text-xs text-gray-500 mb-2 font-medium">Historische Ereignisse:</p>
          <div className="flex flex-wrap gap-2">
            {relevantEvents.map((event) => (
              <div
                key={event.year}
                className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md"
                title={event.description}
              >
                <span className="font-semibold">{event.year}</span>
                <span className="text-orange-600">{event.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Gesamtgeburten</p>
            <p className="text-lg font-semibold text-gray-900">{totalBirths}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Zeiträume</p>
            <p className="text-lg font-semibold text-gray-900">{data.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Stärkster Zeitraum</p>
            <p className="text-lg font-semibold text-gray-900">{stats.peakPeriod}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ø Geburten/Zeitraum</p>
            <p className="text-lg font-semibold text-gray-900">{stats.averageBirths}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

