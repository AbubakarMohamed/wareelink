import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AuthService from "@/Services/AuthService";

// ✅ Recharts
import {
    BarChart,
    Bar,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Legend,
} from "recharts";

// ✅ Icons
import {
    BuildingStorefrontIcon,
    BuildingOfficeIcon,
    CubeIcon,
} from "@heroicons/react/24/outline";

// ✅ Count animation
import CountUp from "react-countup";

export default function AdminDashboard({ stats }) {
    const [loading, setLoading] = useState(false);


    // ✅ Fallback to 0 if DB returns null/undefined
    const barData = [
        { name: "Shops", count: stats?.shops || 0 },
        { name: "Companies", count: stats?.companies || 0 },
        { name: "Warehouses", count: stats?.warehouses || 0 },
    ];
    
    const hasData = barData.some(item => item.count > 0);
    
 
    

    const handleExport = () => {
        // Placeholder export logic
        alert("📦 Export feature coming soon!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-lg">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-gray-800 dark:text-white">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* ✅ Top Section: Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Shops"
                            value={stats?.shops || 0}
                            icon={<BuildingStorefrontIcon className="w-10 h-10 text-blue-500" />}
                        />
                        <StatCard
                            title="Companies"
                            value={stats?.companies || 0}
                            icon={<BuildingOfficeIcon className="w-10 h-10 text-green-500" />}
                        />
                        <StatCard
                            title="Warehouses"
                            value={stats?.warehouses || 0}
                            icon={<CubeIcon className="w-10 h-10 text-purple-500" />}
                        />
                    </div>

                    {/* ✅ Middle Section: Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    System Overview
                                </h3>
                                <button
                                    onClick={handleExport}
                                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Export Stats
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        

                    </div>

                    {/* ✅ Bottom Section: Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            Recent Activity
                        </h3>
                        <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                            <li>🛍️ New shop registered: <strong>Urban Mart</strong></li>
                            <li>🏢 Company profile updated: <strong>TechNova Ltd</strong></li>
                            <li>🏬 Warehouse inventory synced: <strong>East Zone</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ✅ Reusable StatCard Component
function StatCard({ title, value, icon }) {
    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 shadow rounded-lg flex items-center space-x-4 border-l-4 border-blue-400 dark:border-blue-600">
            <div>{icon}</div>
            <div>
                <p className="text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CountUp end={value || 0} duration={1.5} />
                </h3>
            </div>
        </div>
    );
}
