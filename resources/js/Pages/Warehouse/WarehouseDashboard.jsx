import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import AuthService from "@/Services/AuthService";

// ✅ Heroicons
import {
    CubeIcon,
    ArchiveBoxIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

// ✅ Recharts for Pie Chart
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function WarehouseDashboard() {
    const { warehouse, stats, recentActivity, auth } = usePage().props;

    useEffect(() => {
        AuthService.getUser().then((user) => {
            if (user.role !== "warehouse_admin") {
                router.visit(AuthService.getRedirectUrl(user.role));
            }
        });
    }, []);

    // ✅ Utility to style activity type
    const actionBadge = (action) => {
        const base = "px-2 py-1 text-xs rounded-full font-medium";
        switch (action) {
            case "created":
                return `${base} bg-green-100 text-green-700`;
            case "updated":
                return `${base} bg-blue-100 text-blue-700`;
            case "deleted":
                return `${base} bg-red-100 text-red-700`;
            default:
                return `${base} bg-gray-100 text-gray-700`;
        }
    };

    // ✅ Pie Chart Data
    const spaceUsed = stats?.stocks ?? 0;
    const spaceRemaining = Math.max((warehouse?.capacity ?? 0) - spaceUsed, 0);
    const pieData = [
        { name: "Space Used", value: spaceUsed },
        { name: "Space Remaining", value: spaceRemaining },
    ];
    const COLORS = ["#6366f1", "#10b981"]; // Indigo & Green

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Warehouse Admin Dashboard
                </h2>
            }
        >
            <Head title="Warehouse Admin Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* ✅ Welcome Banner */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            🎉 Welcome back, {auth?.user?.name || "Warehouse Admin"}!
                        </h3>
                        {warehouse ? (
                            <p className="mt-2 text-gray-600">
                                You are managing <strong>{warehouse.name}</strong> located
                                at <strong>{warehouse.location}</strong>. Keep track of{" "}
                                <strong>products</strong> and{" "}
                                <strong>stock levels</strong> efficiently.
                            </p>
                        ) : (
                            <p className="mt-2 text-gray-600">
                                No warehouse has been assigned to you yet.
                            </p>
                        )}
                    </div>

                    {/* ✅ KPI Cards */}
                    {warehouse && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Products */}
                            <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
                                <CubeIcon className="h-10 w-10 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Total Products</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats?.products ?? 0}
                                    </p>
                                </div>
                            </div>

                            {/* Stock Quantity */}
                            <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
                                <ArchiveBoxIcon className="h-10 w-10 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Total Stock</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats?.stocks ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✅ Pie Chart - Space Usage */}
                    {warehouse && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                Warehouse Space Usage
                            </h4>
                            <div className="h-64">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, value }) =>
                                                `${name}: ${value}`
                                            }
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ✅ Quick Actions */}
                    {warehouse && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                Quick Actions
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() =>
                                        router.visit(
                                            route("warehouse.inventory.index", warehouse.id)
                                        )
                                    }
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Manage Stocks
                                </button>
                                <button
                                    onClick={() =>
                                        router.visit(
                                            route("warehouse.requests.index", warehouse.id)
                                        )
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Manage Requests
                                </button>
                                
                                <button
                                    onClick={() =>
                                        router.visit(
                                            route("warehouse.invoices.index", warehouse.id)
                                        )
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Manage Invoices
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ✅ Recent Activity */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Recent Activity
                        </h4>
                        {recentActivity && recentActivity.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {recentActivity.map((activity, index) => (
                                    <li
                                        key={index}
                                        className="py-3 flex justify-between items-center text-sm"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className={actionBadge(activity.action)}>
                                                {activity.action}
                                            </span>
                                            <span className="text-gray-800">
                                                {activity.description}
                                            </span>
                                        </div>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(
                                                activity.created_at
                                            ).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No recent activity.</p>
                        )}
                    </div>

                    {/* ✅ Analytics (Placeholder) */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Analytics Overview
                        </h4>
                        <div className="flex items-center space-x-4">
                            <ChartBarIcon className="h-10 w-10 text-blue-600" />
                            <p className="text-gray-600">
                                Inventory and warehouse performance charts will appear here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
