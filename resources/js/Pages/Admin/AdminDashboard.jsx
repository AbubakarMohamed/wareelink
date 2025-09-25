import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect } from "react";
import AuthService from "@/Services/AuthService";

// ✅ Recharts
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Legend,
} from "recharts";

export default function AdminDashboard({ stats }) {
    useEffect(() => {
        AuthService.getUser().then((user) => {
            if (user.role !== "admin") {
                router.visit(AuthService.getRedirectUrl(user.role));
            }
        });
    }, []);

    // Dummy data (replace with your backend-provided stats)
    const barData = [
        // { name: "Users", count: stats?.users || 120 },
        { name: "Shops", count: stats?.shops || 34 },
        { name: "Companies", count: stats?.companies || 0 },
        { name: "Warehouses", count: stats?.warehouses || 12 },
        // { name: "Invoices", count: stats?.invoices || 452 },
    ];

    const pieData = [
        { name: "Paid", value: stats?.paidInvoices || 320 },
        { name: "Unpaid", value: stats?.unpaidInvoices || 0 },
    ];

    const COLORS = ["#10B981", "#EF4444"];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* ✅ Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* <div className="bg-white p-6 shadow rounded-lg">
                            <p className="text-gray-500">Users</p>
                            <h3 className="text-2xl font-bold">{stats?.users || 120}</h3>
                        </div> */}
                        <div className="bg-white p-6 shadow rounded-lg">
                            <p className="text-gray-500">Shops</p>
                            <h3 className="text-2xl font-bold">{stats?.shops || 34}</h3>
                        </div>
                        <div className="bg-white p-6 shadow rounded-lg">
        <p className="text-gray-500">Companies</p>
        <h3 className="text-2xl font-bold">{stats?.companies || 0}</h3>
    </div>
                        <div className="bg-white p-6 shadow rounded-lg">
                            <p className="text-gray-500">Warehouses</p>
                            <h3 className="text-2xl font-bold">{stats?.warehouses || 12}</h3>
                        </div>
                        <div className="bg-white p-6 shadow rounded-lg">
                            <p className="text-gray-500">Invoices</p>
                            <h3 className="text-2xl font-bold">{stats?.invoices || 452}</h3>
                        </div>
                    </div>

                    {/* ✅ Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar Chart */}
                        <div className="bg-white p-6 shadow rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
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

                        {/* Pie Chart */}
                        <div className="bg-white p-6 shadow rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Invoices Status</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
