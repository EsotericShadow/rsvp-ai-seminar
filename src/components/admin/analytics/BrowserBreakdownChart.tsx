'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type BrowserBreakdownChartProps = {
  data: { name: string; count: number }[]
}

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#06b6d4', '#84cc16', '#f59e0b']

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export default function BrowserBreakdownChart({ data }: BrowserBreakdownChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#1a1d18', 
              border: '1px solid rgba(160, 173, 146, 0.3)', 
              borderRadius: '10px' 
            }}
            labelStyle={{ color: '#f1f5f0' }}
            formatter={(value) => [formatNumber(value as number), 'Visits']}
          />
          <Legend 
            wrapperStyle={{ color: '#f1f5f0', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
