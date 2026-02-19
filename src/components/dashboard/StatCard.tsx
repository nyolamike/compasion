import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'teal' | 'coral' | 'amber' | 'purple' | 'blue';
  onClick?: () => void;
}

const colorClasses = {
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-emerald-50',
    icon: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    text: 'text-teal-600',
  },
  coral: {
    bg: 'bg-gradient-to-br from-coral-50 to-orange-50',
    icon: 'bg-gradient-to-br from-coral-500 to-orange-500',
    text: 'text-coral-600',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    icon: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    text: 'text-amber-600',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    icon: 'bg-gradient-to-br from-purple-500 to-violet-500',
    text: 'text-purple-600',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    text: 'text-blue-600',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  onClick,
}) => {
  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`${colors.bg} rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend.isPositive ? 'text-emerald-600' : 'text-red-500'
            }`}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${colors.icon} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
