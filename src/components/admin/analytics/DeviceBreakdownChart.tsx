'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type DeviceBreakdownChartProps = {
  data: { name: string; count: number }[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export default function DeviceBreakdownChart({ data }: DeviceBreakdownChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, top: 10, right: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} width={48} tickFormatter={formatNumber} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px' }}
            labelStyle={{ color: '#cbd5f5' }}
            formatter={(value) => [formatNumber(value as number), 'Visits']}
          />
          <Bar dataKey="count" fill="#38BDF8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
