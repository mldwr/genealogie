'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { AgePyramidData } from '../data';

interface AgePyramidChartProps {
    data: AgePyramidData[];
}

// Custom tooltip to show absolute values (positive numbers for males)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const maleData = payload.find((p: any) => p.dataKey === 'male');
        const femaleData = payload.find((p: any) => p.dataKey === 'female');

        const maleCount = maleData ? Math.abs(maleData.value) : 0;
        const femaleCount = femaleData ? femaleData.value : 0;

        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
                <p className="font-semibold text-gray-900 mb-1">Altersgruppe {label}</p>
                <div className="space-y-1">
                    <p className="flex items-center text-blue-600">
                        <span className="w-20">Männer:</span>
                        <span className="font-medium">{maleCount}</span>
                    </p>
                    <p className="flex items-center text-rose-500">
                        <span className="w-20">Frauen:</span>
                        <span className="font-medium">{femaleCount}</span>
                    </p>
                    <div className="pt-1 mt-1 border-t border-gray-100 flex items-center text-gray-600 font-medium">
                        <span className="w-20">Gesamt:</span>
                        <span>{maleCount + femaleCount}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function AgePyramidChart({ data }: AgePyramidChartProps) {
    // Reverse data to display youngest at the bottom (0-4) and oldest at the top (90+)
    const chartData = [...data].reverse();

    // Calculate max value to set symmetrical X-axis domain
    const maxMale = Math.max(...data.map((d) => Math.abs(d.male)));
    const maxFemale = Math.max(...data.map((d) => d.female));
    const maxValue = Math.max(maxMale, maxFemale, 1); // Ensure at least 1 to avoid domain errors

    // Round up to nearest nice number (e.g. 10, 50, 100)
    const rangeMax = Math.ceil(maxValue * 1.1); // Add 10% padding

    const formatXAxis = (tickItem: number) => {
        return Math.abs(tickItem).toString();
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Alterspyramide bei Deportation (1941)</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Demografische Verteilung nach Alter und Geschlecht
                </p>
            </div>

            {data.length === 0 ? (
                <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                        <p className="text-gray-400 text-lg">Keine Daten verfügbar</p>
                        <p className="text-gray-500 text-sm mt-1">Altersdaten konnten nicht geladen werden</p>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        stackOffset="sign"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                            type="number"
                            domain={[-rangeMax, rangeMax]}
                            tickFormatter={formatXAxis}
                            stroke="#9ca3af" // gray-400
                        />
                        <YAxis
                            dataKey="ageGroup"
                            type="category"
                            width={50}
                            tick={{ fontSize: 12 }}
                            interval={0} // Show all ticks (age groups)
                            stroke="#4b5563" // gray-600
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => (value === 'male' ? 'Männer' : 'Frauen')}
                        />
                        <ReferenceLine x={0} stroke="#6b7280" />

                        <Bar dataKey="female" name="female" fill="#ec4899" stackId="a" /> {/* pink-500 */}
                        <Bar dataKey="male" name="male" fill="#3b82f6" stackId="a" /> {/* blue-500 */}
                    </BarChart>
                </ResponsiveContainer>
            )}

            {data.length > 0 && (
                <div className="mt-4 text-xs text-center text-gray-400">
                    * Männer links (blau), Frauen rechts (pink). Alter zum Zeitpunkt der Deportation 1941.
                </div>
            )}
        </div>
    );
}
