"use client"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, usePage } from "@inertiajs/react"
import { useEffect } from "react"
import AuthService from "@/Services/AuthService"

// ✅ Heroicons
import {
  CubeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

export default function CompanyDashboard() {
  const { stats, warehouseStockSummary, recentActivity, auth } = usePage().props

  useEffect(() => {
    AuthService.getUser().then((user) => {
      if (user.role !== "company") {
        router.visit(AuthService.getRedirectUrl(user.role))
      }
    })
  }, [])

  const actionBadge = (action) => {
    const base = "px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5"
    switch (action) {
      case "created":
        return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`
      case "updated":
        return `${base} bg-blue-50 text-blue-700 border border-blue-200`
      case "deleted":
        return `${base} bg-rose-50 text-rose-700 border border-rose-200`
      default:
        return `${base} bg-slate-50 text-slate-700 border border-slate-200`
    }
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-2xl font-bold leading-tight text-slate-900">Dashboard</h2>}>
      <Head title="Company Dashboard" />

      <div className="py-12 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Welcome Hero */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Welcome back, {auth?.user?.name || "Company Admin"}</h3>
                <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                  Manage your <span className="font-semibold text-white">warehouses</span>, oversee{" "}
                  <span className="font-semibold text-white">products</span>, and coordinate{" "}
                  <span className="font-semibold text-white">distribution</span> all in one place.
                </p>
              </div>
              <SparklesIcon className="h-8 w-8 text-slate-400 flex-shrink-0" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <CubeIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalProducts ?? 0}</p>
              <p className="text-xs text-slate-500 mt-2">Active in system</p>
            </div>

            {/* Warehouses */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Warehouses</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalWarehouses ?? 0}</p>
              <p className="text-xs text-slate-500 mt-2">Operational locations</p>
            </div>

            {/* Warehouse Admins */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-amber-600" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Warehouse Admins</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalWarehouseAdmins ?? 0}</p>
              <p className="text-xs text-slate-500 mt-2">Team members</p>
            </div>

            {/* Total Stock Allocated */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Stock Allocated</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalStockAllocated ?? 0}</p>
              <p className="text-xs text-slate-500 mt-2">Across all warehouses</p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {stats?.lowStockProducts > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex items-center gap-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-rose-600" />
              <p className="text-sm text-rose-700 font-medium">
                {stats?.lowStockProducts} products are low in stock. Consider restocking soon!
              </p>
            </div>
          )}

          {/* Warehouse-wise Stock Summary */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h4 className="text-lg font-bold text-slate-900 mb-6">Warehouse Stock Summary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 border-b text-sm font-semibold text-slate-700">Warehouse</th>
                    <th className="px-4 py-2 border-b text-sm font-semibold text-slate-700">Products Count</th>
                    <th className="px-4 py-2 border-b text-sm font-semibold text-slate-700">Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseStockSummary.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 border-b">{w.warehouse}</td>
                      <td className="px-4 py-2 border-b">{w.products_count}</td>
                      <td className="px-4 py-2 border-b">{w.total_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h4 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h4>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className={actionBadge(activity.action)}>{activity.action}</span>
                      <span className="text-slate-700 font-medium text-sm">{activity.description}</span>
                    </div>
                    <span className="text-slate-500 text-xs font-medium whitespace-nowrap ml-4">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
