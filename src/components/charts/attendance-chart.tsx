"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export function AttendanceChart({
  data,
}: {
  data: { name: string; rate: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <div style={{ width: "100%", height: Math.max(data.length * 40, 120) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((_, index) => (
              <Cell key={index} fill="var(--color-primary, #d46211)" fillOpacity={0.8} />
            ))}
            <LabelList
              dataKey="rate"
              position="right"
              formatter={(v) => `${v ?? 0}%`}
              style={{ fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
