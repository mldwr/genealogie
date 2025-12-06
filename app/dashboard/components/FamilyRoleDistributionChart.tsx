'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { FamilyRoleDistributionData } from '../data';

interface FamilyRoleDistributionChartProps {
  data: FamilyRoleDistributionData;
}

// Color palette for the donut chart segments (accessible and distinctive)
const COLORS = [
  '#3b82f6', // blue-500 - Familienoberhaupt
  '#ef4444', // red-500 - Ehefrau
  '#10b981', // emerald-500 - Sohn
  '#f59e0b', // amber-500 - Tochter
  '#8b5cf6', // violet-500 - Other roles
  '#ec4899', // pink-500 - Additional colors if needed
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

// Custom label for pie chart segments
const renderCustomLabel = (entry: any) => {
  if (entry.percentage < 3) return ''; // Hide labels for very small segments
  return `${entry.count}`;
};

// Custom tooltip for detailed information
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.role}</p>
        <p className="text-sm text-blue-600">
          {data.count} Personen ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

// Functions cleaned up - using inline implementations

export default function FamilyRoleDistributionChart({ data }: FamilyRoleDistributionChartProps) {
  // Create display data for the chart (only show roles with data)
  const displayData = data.roles.filter(role => role.count > 0);

  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Familienrollenverteilung</h3>
        <p className="text-sm text-gray-500 mt-1">
          Verteilung der Familienrollen in der Deportationsdatenbank
        </p>
      </div>

      {displayData.length === 0 ? (
        // Empty state
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-400 text-lg">Keine Daten verfügbar</p>
            <p className="text-gray-500 text-sm mt-1">Familienrollendaten konnten nicht geladen werden</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={displayData as any}
              cx="40%"
              cy="50%"
              innerRadius={60} // Creates donut effect
              outerRadius={100}
              paddingAngle={2} // Small gap between segments
              dataKey="count"
              nameKey="role"
              label={renderCustomLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
            >
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
              cursor={false}
              offset={8}
            />

            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                paddingLeft: '20px',
                fontSize: '12px'
              }}
              formatter={(value) => {
                const roleData = displayData.find(role => role.role === value);
                if (!roleData) return value;
                return `${value}\n${roleData.count} (${roleData.percentage.toFixed(1)}%)`;
              }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Summary Statistics */}
      {displayData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Gesamt Personen</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.totalPersons.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Verschiedene Rollen</p>
              <p className="text-lg font-semibold text-gray-900">{data.uniqueRoles}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Häufigste Rolle</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayData[0]?.role || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Max. Anzahl</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.max(...displayData.map(r => r.count)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
