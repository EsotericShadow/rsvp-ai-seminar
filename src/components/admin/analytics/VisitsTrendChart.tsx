'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type VisitsTrendChartProps = {
  data: { label: string; count: number }[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export default function VisitsTrendChart({ data }: VisitsTrendChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, top: 10, right: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#31C48D" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#31C48D" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} width={48} tickFormatter={formatNumber} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1d18', border: '1px solid rgba(160, 173, 146, 0.3)', borderRadius: '10px' }}
            labelStyle={{ color: '#f1f5f0' }}
            formatter={(value) => [formatNumber(value as number), 'Visits']}
          />
          <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#trend)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
