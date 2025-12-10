'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { FamilySizeDistributionData } from '../data';

interface FamilySizeChartProps {
    data: FamilySizeDistributionData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-blue-600">
                    {payload[0].value} Familien
                </p>
            </div>
        );
    }
    return null;
};

export default function FamilySizeChart({ data }: FamilySizeChartProps) {
    // Determine where to place the reference line.
    let avgCategory = '';
    if (data.averageSize <= 2) avgCategory = '1-2 Mitglieder';
    else if (data.averageSize <= 4) avgCategory = '3-4 Mitglieder';
    else if (data.averageSize <= 6) avgCategory = '5-6 Mitglieder';
    else if (data.averageSize <= 8) avgCategory = '7-8 Mitglieder';
    else avgCategory = '9+ Mitglieder';

    return (
        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Familiengrößenverteilung</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Anzahl der Mitglieder pro Familie
                </p>
            </div>

            {data.totalFamilies === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-gray-400 text-lg">Keine Daten verfügbar</p>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={data.rows}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="range"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                        <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                        <ReferenceLine
                            x={avgCategory}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            label={{
                                position: 'top',
                                value: `Ø ${data.averageSize}`,
                                fill: '#ef4444',
                                fontSize: 12
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-xs text-gray-500">Gesamt Familien</p>
                    <p className="text-lg font-semibold text-gray-900">{data.totalFamilies}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Durchschnittliche Größe</p>
                    <p className="text-lg font-semibold text-gray-900">{data.averageSize}</p>
                </div>
            </div>
        </div>
    );
}
