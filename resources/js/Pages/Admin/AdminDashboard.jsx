"use client"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head } from "@inertiajs/react"
import {
  BarChart, Bar, LineChart, Line, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusCircleIcon,
  LightBulbIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import CountUp from "react-countup"
import { useState, useEffect } from "react"

export default function AdminDashboard({
  auth,
  stats,
  financials,
  charts,
  topShops,
  recent,
  companyInsights,
}) {
  const { total_companies, total_warehouses, total_shops, total_invoices } = stats || {}
  const { totalRevenue, pendingAmount, invoiceSummary } = financials || {}
  const { monthlySales } = charts || {}
  const revenueByCompany = companyInsights?.revenueByCompany || []
  const topCompanies = companyInsights?.topCompanies || []
  const invoiceCountsByCompany = companyInsights?.invoiceCountsByCompany || []

  const PIE_COLORS = [
    "#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f97316"
  ]

  // Smart insight generation
  // const [insight, setInsight] = useState("")
  // useEffect(() => {
  //   if (monthlySales && monthlySales.length >= 2) {
  //     const last = monthlySales[monthlySales.length - 1]?.total || 0
  //     const prev = monthlySales[monthlySales.length - 2]?.total || 0
  //     const change = ((last - prev) / prev) * 100
  //     if (isNaN(change)) return
  //     if (change > 5) {
  //       setInsight(`Revenue is trending up by ${change.toFixed(1)}% this month! 🚀`)
  //     } else if (change < -5) {
  //       setInsight(`Watch out: revenue dropped ${Math.abs(change).toFixed(1)}% last month.`)
  //     } else {
  //       setInsight("Steady performance this month.")
  //     }
  //   } else {
  //     setInsight("Welcome! Add your first invoice to see insights.")
  //   }
  // }, [monthlySales])

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h2>
          {/* {insight && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl">
              <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium">{insight}</p>
            </div>
          )} */}
        </div>
      }
    >
      <Head title="Admin Dashboard" />

      <main className="py-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ======= STATS OVERVIEW ======= */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Companies" value={total_companies} icon={<BuildingOfficeIcon className="w-8 h-8 text-indigo-600" />} color="indigo" />
            <StatCard title="Warehouses" value={total_warehouses} icon={<TruckIcon className="w-8 h-8 text-emerald-600" />} color="emerald" />
            <StatCard title="Shops" value={total_shops} icon={<BuildingStorefrontIcon className="w-8 h-8 text-amber-600" />} color="amber" />
            <StatCard title="Invoices" value={total_invoices} icon={<ChartPieIcon className="w-8 h-8 text-rose-600" />} color="rose" />
          </section>

          {/* ======= FINANCIAL SUMMARY ======= */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FinancialCard
              totalRevenue={totalRevenue}
              pendingAmount={pendingAmount}
              invoiceSummary={invoiceSummary}
            />

            <ChartCard title="Monthly Sales" subtitle="Revenue trend over time">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlySales || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#4f46e5" }}
                    activeDot={{ r: 6, fill: "#4f46e5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Invoice Status" subtitle="Distribution of invoice states">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={[
                    { name: "Paid", count: invoiceSummary?.paid || 0, color: "#10b981" },
                    { name: "Unpaid", count: invoiceSummary?.unpaid || 0, color: "#ef4444" },
                    { name: "Invoiced", count: invoiceSummary?.invoiced || 0, color: "#6366f1" },
                  ]}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count">
                    {invoiceSummary && Object.keys(invoiceSummary).length > 0 && (
                      <>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#6366f1" />
                      </>
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          {/* ======= COMPANIES & SHOPS ======= */}
          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <PerformanceList
              title="Top Companies"
              data={topCompanies}
              emptyMessage="No company data yet."
              action={{ label: "Add Company", href: "/companies/create" }}
            />

            <PerformanceList
              title="Top Shops"
              data={topShops}
              emptyMessage="No shop data yet."
              action={{ label: "Add Shop", href: "/shops/create" }}
            />

            <ChartCard title="Invoices by Company" subtitle="Volume per company">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={invoiceCountsByCompany}
                    dataKey="count"
                    nameKey="company"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(invoiceCountsByCompany || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {(!invoiceCountsByCompany || invoiceCountsByCompany.length === 0) && (
                <EmptyState message="No invoice distribution data." />
              )}
            </ChartCard>
          </section>

          {/* ======= RECENT ACTIVITY ======= */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActivityPanel title="Recent Invoices" data={recent?.invoices} type="invoice" />
            <ActivityPanel title="New Shops" data={recent?.shops} type="shop" />
            <ActivityPanel title="New Warehouses" data={recent?.warehouses} type="warehouse" />
          </section>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}

// ====== COMPONENTS ======

function StatCard({ title, value, icon, color }) {
  const bgMap = {
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
  }
  const iconBg = bgMap[color]

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-slate-900">
          <CountUp end={value || 0} duration={1.2} separator="," />
        </p>
      </div>
    </div>
  )
}

function FinancialCard({ totalRevenue, pendingAmount, invoiceSummary }) {
  const net = (totalRevenue || 0) - (pendingAmount || 0)
  const trend = net > 0 ? "positive" : "negative"

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-4">Financial Snapshot</h3>
      
      <div className="space-y-4">
        <Metric label="Total Revenue" value={`KSh ${totalRevenue?.toLocaleString() || '0'}`} color="text-emerald-600" />
        <Metric label="Pending" value={`KSh ${pendingAmount?.toLocaleString() || '0'}`} color="text-rose-600" />
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Net Collected</span>
            <span className={`font-bold ${trend === 'positive' ? 'text-emerald-700' : 'text-rose-700'}`}>
              KSh {net.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm">
            {trend === 'positive' ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-rose-600" />
            )}
            <span className={trend === 'positive' ? 'text-emerald-600' : 'text-rose-600'}>
              {trend === 'positive' ? 'Positive cash flow' : 'Outstanding balance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
      {children}
    </div>
  )
}

function PerformanceList({ title, data = [], emptyMessage, action }) {
  const sorted = [...data].sort((a, b) => (b.performance || 0) - (a.performance || 0))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {sorted.length > 0 ? (
          sorted.map((item, i) => (
            <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900">{item.name || item.company?.name || "N/A"}</p>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span>Req: {item.requests || item.total_requests || 0}</span>
                    <span>Done: {item.completed || 0}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    (item.performance || 0) >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    (item.performance || 0) >= 50 ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {item.performance || 0}%
                  </span>
                  {/* Performance bar */}
                  <div className="w-16 h-1.5 mt-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (item.performance || 0) >= 80 ? 'bg-emerald-500' :
                        (item.performance || 0) >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${item.performance || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <InformationCircleIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">{emptyMessage}</p>
            {action && (
              <a
                href={action.href}
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircleIcon className="w-4 h-4" />
                {action.label}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityPanel({ title, data, type }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {data?.length ? (
          data.slice(0, 5).map((item, i) => (
            <div key={i} className="text-sm border-l-2 border-slate-200 pl-3 py-1">
              {type === "invoice" && (
                <span className={item.status === "paid" ? "text-emerald-700" : "text-rose-700"}>
                  #{item.id} • {item.status}
                </span>
              )}
              {type === "shop" && <span>{item.name}</span>}
              {type === "warehouse" && <span>{item.name}</span>}
              <div className="text-xs text-slate-500 mt-1">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <EmptyState message={`No recent ${type}s.`} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-slate-500">
      <ExclamationCircleIcon className="w-6 h-6 text-slate-400 mb-1" />
      <p className="text-xs text-center">{message}</p>
    </div>
  )
}