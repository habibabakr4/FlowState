import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function StatCard({
  label,
  value = 0,
  icon: Icon,
  variant = 'projects',
  hasDot = false,
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon-wrapper stat-icon-${variant}`}>
          {Icon && <Icon size={20} />}
          {hasDot && <span className="stat-active-dot"></span>}
        </div>
        <TrendingUp size={16} className="stat-trend-icon" />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
