'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type DailyPatternsChartProps = {
  data: { day: number; name: string; count: number }[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export default function DailyPatternsChart({ data }: DailyPatternsChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, top: 10, right: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} width={48} tickFormatter={formatNumber} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1d18', border: '1px solid rgba(160, 173, 146, 0.3)', borderRadius: '10px' }}
            labelStyle={{ color: '#f1f5f0' }}
            formatter={(value) => [formatNumber(value as number), 'Visits']}
          />
          <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}







