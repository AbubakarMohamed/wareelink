import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import AuthService from "@/Services/AuthService";

// ✅ Heroicons
import {
    CubeIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function CompanyDashboard() {
    const { stats, recentActivity, auth } = usePage().props;

    useEffect(() => {
        AuthService.getUser().then((user) => {
            if (user.role !== "company") {
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Company Dashboard
                </h2>
            }
        >
            <Head title="Company Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* ✅ Welcome Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            🎉 Welcome back, {auth?.user?.name || "Company Admin"}!
                        </h3>
                        <p className="mt-2 text-gray-600">
                            From here you can oversee <strong>warehouses</strong>,
                            manage <strong>products</strong>, and coordinate{" "}
                            <strong>distribution to shops</strong>.
                        </p>
                    </div>

                    {/* ✅ KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                        {/* Warehouses */}
                        <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
                            <BuildingOfficeIcon className="h-10 w-10 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-500">Active Warehouses</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {stats?.warehouses ?? 0}
                                </p>
                            </div>
                        </div>

                        {/* Warehouse Admins */}
                        <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
                            <UserGroupIcon className="h-10 w-10 text-yellow-500" />
                            <div>
                                <p className="text-sm text-gray-500">Warehouse Admins</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {stats?.warehouseAdmins ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Quick Actions */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Quick Actions
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => router.visit(route("company.products.index"))}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Manage Products
                            </button>
                            <button
                                onClick={() => router.visit(route("company.warehouses.index"))}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Manage Warehouses
                            </button>
                            <button
                                onClick={() => router.visit(route("company.warehouse-stocks.index"))}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Manage Stocks
                            </button>
                            <button
                                onClick={() =>
                                    router.visit(route("company.warehouse-admins.index"))
                                }
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                            >
                                Manage Warehouse Admins
                            </button>
                        </div>
                    </div>

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
                                            {new Date(activity.created_at).toLocaleString()}
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
                                Sales and warehouse activity charts will appear here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
