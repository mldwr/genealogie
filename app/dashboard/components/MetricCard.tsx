'use client';

import { Users, Baby, UserCheck, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  iconName?: 'users' | 'baby' | 'userCheck' | 'trendingUp';
  iconColor?: string;
  subtitle?: string;
}

// Map icon names to icon components
const iconMap = {
  users: Users,
  baby: Baby,
  userCheck: UserCheck,
  trendingUp: TrendingUp,
};

export default function MetricCard({
  title,
  value,
  iconName,
  iconColor = 'text-blue-600',
  subtitle,
}: MetricCardProps) {
  const Icon = iconName ? iconMap[iconName] : null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

