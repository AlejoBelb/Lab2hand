// Gráfica reactiva con Recharts para visualizar pares (t, value)
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function RealtimeChart({ data, unit }) {
  const safeData = Array.isArray(data) ? data : []
  return (
    <div style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" type="number" tickFormatter={(v) => String(v)} />
          <YAxis tickFormatter={(v) => String(v)} label={{ value: unit || 'u', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(v) => [v, `valor (${unit || 'u'})`]} labelFormatter={(l) => `t=${l}s`} />
          <Line type="monotone" dataKey="value" dot={true} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
