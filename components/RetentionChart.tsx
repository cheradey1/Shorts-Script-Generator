import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RETENTION_WEAK_THRESHOLD } from '../constants';

interface RetentionChartProps {
  data: number[];
  t: any;
}

const RetentionChart: React.FC<RetentionChartProps> = ({ data, t }) => {
  const chartData = data.map((p, index) => ({
    second: index + 1,
    retention: p * 100, // as percentage
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-surface p-2 border border-brand-muted rounded-md shadow-lg">
          <p className="label text-brand-text-dim">{`Second ${label}`}</p>
          <p className="intro text-brand-text">{`P(stay): ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full bg-brand-bg p-2 rounded-lg border border-brand-muted">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#34364A" />
          <XAxis dataKey="second" stroke="#8B8EA3" fontSize={12} />
          <YAxis 
            stroke="#8B8EA3" 
            fontSize={12} 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="retention" stroke="#4F46E5" strokeWidth={2} dot={false} />
          <ReferenceLine y={RETENTION_WEAK_THRESHOLD * 100} label={{ value: t.weakZone, position: 'insideTopLeft', fill: '#f87171', fontSize: 10 }} stroke="#f87171" strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetentionChart;
