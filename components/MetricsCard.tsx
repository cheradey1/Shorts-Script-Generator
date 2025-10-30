
import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string;
  tooltip: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, tooltip }) => {
  return (
    <div className="bg-brand-bg p-4 rounded-lg border border-brand-muted">
        <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-brand-text-dim">{title}</h4>
            <div className="relative group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full mb-2 w-48 bg-brand-bg border border-brand-muted text-center text-xs text-brand-text-dim rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    {tooltip}
                </div>
            </div>
        </div>
      <p className="text-2xl font-bold text-brand-text mt-1">{value}</p>
    </div>
  );
};

export default MetricsCard;
