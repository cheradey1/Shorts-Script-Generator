import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TriggerImpact } from '../services/markovService';

// Fix: The data prop receives trigger names as translated strings for display, not the original `Trigger` type.
// The previous type `(TriggerImpact & { trigger: string })[]` incorrectly resolved to `TriggerImpact[]`,
// causing a type mismatch. The new type correctly represents an object with the `impact` from
// `TriggerImpact` and a `trigger` property that is a `string`.
interface TriggerImpactAnalysisProps {
  data: (Omit<TriggerImpact, 'trigger'> & { trigger: string })[];
  t: any;
}

const TriggerImpactAnalysis: React.FC<TriggerImpactAnalysisProps> = ({ data, t }) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-brand-surface p-2 border border-brand-muted rounded-md shadow-lg">
              <p className="label text-brand-text-dim capitalize">{label}</p>
              <p className="intro text-brand-text">{`${t.impactLabel}: +${payload[0].value.toFixed(2)} ${t.pp}`}</p>
            </div>
          );
        }
        return null;
    };
    
    const COLORS = ['#4F46E5', '#A855F7', '#22D3EE', '#6d708a', '#a9abbd'];

    return (
        <div>
            <h3 className="text-lg font-semibold text-brand-text mb-2">{t.triggerImpactTitle}</h3>
            <p className="text-sm text-brand-text-dim mb-4">
                {t.triggerImpactDescription}
            </p>
            <div className="h-64 w-full bg-brand-bg p-2 rounded-lg border border-brand-muted">
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#34364A" horizontal={false} />
                        <XAxis type="number" stroke="#8B8EA3" fontSize={12} tickFormatter={(value) => `${value.toFixed(1)} ${t.pp}`} />
                        <YAxis 
                            dataKey="trigger" 
                            type="category" 
                            stroke="#8B8EA3" 
                            fontSize={12} 
                            tickFormatter={(value) => value}
                            width={100}
                            tick={{ textAnchor: 'end' }}
                            interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}/>
                        <Bar dataKey="impact" barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TriggerImpactAnalysis;