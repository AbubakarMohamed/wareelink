import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function WarehouseReport() {
    const { invoices, auth, flash } = usePage().props;
    const isAdmin = auth.user.role === "admin";

    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("");

    // Filter invoices by company and warehouse if admin
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            let companyMatch = true;
            let warehouseMatch = true;

            if (isAdmin && selectedCompany) {
                companyMatch = inv.warehouse?.company?.name === selectedCompany;
            }
            if (isAdmin && selectedWarehouse) {
                warehouseMatch = inv.warehouse?.name === selectedWarehouse;
            }
            return companyMatch && warehouseMatch;
        });
    }, [invoices, selectedCompany, selectedWarehouse, isAdmin]);

    // Only consider paid invoices
    const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid");

    // Calculate grand totals
    const grandTotalQuantity = paidInvoices.reduce((sum, inv) => sum + (inv.request?.quantity || 0), 0);
    const grandTotalAmount = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    // Get unique companies and warehouses for admin filters
    const companies = isAdmin
        ? Array.from(new Set(invoices.map(inv => inv.warehouse?.company?.name).filter(Boolean)))
        : [];
    const warehouses = isAdmin
        ? Array.from(new Set(invoices.map(inv => inv.warehouse?.name).filter(Boolean)))
        : [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Paid Invoices</h2>}
        >
            <Head title="Warehouse Report" />

            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-2">Warehouse Sales Report</h2>

                {flash.success && (
                    <div className="bg-green-100 text-green-800 p-3 rounded">{flash.success}</div>
                )}
                {flash.error && (
                    <div className="bg-red-100 text-red-800 p-3 rounded">{flash.error}</div>
                )}

                {/* Admin Filters */}
                {isAdmin && (
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div>
                            <label className="block mb-1 font-semibold">Filter by Company</label>
                            <select
                                className="border rounded p-2 min-w-[150px]"
                                value={selectedCompany}
                                onChange={e => setSelectedCompany(e.target.value)}
                            >
                                <option value="">All Companies</option>
                                {companies.map(company => (
                                    <option key={company} value={company}>{company}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">Filter by Warehouse</label>
                            <select
                                className="border rounded p-2 min-w-[150px]"
                                value={selectedWarehouse}
                                onChange={e => setSelectedWarehouse(e.target.value)}
                            >
                                <option value="">All Warehouses</option>
                                {warehouses.map(warehouse => (
                                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Shop</th>
                                {isAdmin && (
                                    <>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Warehouse</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Company</th>
                                    </>
                                )}
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount (KSh)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paidInvoices.length > 0 ? (
                                paidInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{inv.request?.stock?.product?.name || "N/A"}</td>
                                        <td className="px-4 py-2">{inv.shop?.name || "N/A"}</td>
                                        {isAdmin && (
                                            <>
                                                <td className="px-4 py-2">{inv.warehouse?.name || "N/A"}</td>
                                                <td className="px-4 py-2">{inv.warehouse?.company?.name || "N/A"}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-2">{inv.request?.quantity || 0}</td>
                                        <td className="px-4 py-2">KSh {Number(inv.amount).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 4} className="px-4 py-2 text-center text-gray-500">
                                        No paid invoices available.
                                    </td>
                                </tr>
                            )}
                            {/* Grand total row */}
                            <tr className="font-bold bg-gray-100">
                                <td colSpan={isAdmin ? 4 : 2} className="px-4 py-2 text-right">Total:</td>
                                <td className="px-4 py-2">{grandTotalQuantity}</td>
                                <td className="px-4 py-2">KSh {grandTotalAmount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
