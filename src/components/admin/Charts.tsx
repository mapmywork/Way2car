"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import styles from "@/styles/admin.module.css";

// Dummy data for visual representation until we build a complex timeseries API
const revenueData = [
  { name: "Mon", revenue: 45000 },
  { name: "Tue", revenue: 52000 },
  { name: "Wed", revenue: 38000 },
  { name: "Thu", revenue: 65000 },
  { name: "Fri", revenue: 89000 },
  { name: "Sat", revenue: 110000 },
  { name: "Sun", revenue: 95000 },
];

const fleetData = [
  { name: "Available", value: 65 },
  { name: "Booked", value: 25 },
  { name: "Maintenance", value: 10 },
];
const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

export default function Charts() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
      
      {/* Revenue Chart */}
      <div className={styles.card}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.125rem", fontWeight: 600 }}>Weekly Revenue</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0f172a' }}
                formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fleet Status Chart */}
      <div className={styles.card}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.125rem", fontWeight: 600 }}>Fleet Status</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fleetData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {fleetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0f172a' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ color: '#94a3b8', fontSize: '14px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
