import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function PurchaseHistory() {
    const { invoices, totalQuantity, totalAmount, auth, isAdmin, shops } = usePage().props;

    const [selectedShop, setSelectedShop] = useState("");

    // ✅ Convert to numeric safely
    const safeNumber = (val) => (isNaN(parseFloat(val)) ? 0 : parseFloat(val));

    // ✅ Filter invoices by shop
    const filteredInvoices = useMemo(() => {
        if (!selectedShop) return invoices;
        return invoices.filter((invoice) => invoice.shop?.id === parseInt(selectedShop));
    }, [invoices, selectedShop]);

    // ✅ Compute totals dynamically for both all & filtered
    const filteredTotals = useMemo(() => {
        const totalQuantity = filteredInvoices.reduce(
            (sum, i) => sum + safeNumber(i.request?.quantity),
            0
        );
        const totalAmount = filteredInvoices.reduce(
            (sum, i) => sum + safeNumber(i.amount),
            0
        );
        return { totalQuantity, totalAmount };
    }, [filteredInvoices]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Purchase History
                </h2>
            }
        >
            <Head title="Purchase History" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Purchase History</h2>

                    {isAdmin && (
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700">
                                Filter by Shop:
                            </label>
                            <select
                                value={selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring focus:ring-indigo-200"
                            >
                                <option value="">All Shops</option>
                                {shops?.map((shop) => (
                                    <option key={shop.id} value={shop.id}>
                                        {shop.name || shop.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {filteredInvoices.length === 0 ? (
                    <p className="text-gray-500">No purchase records available.</p>
                ) : (
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full border">
                            <thead>
                                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                                    {isAdmin && (
                                        <th className="px-4 py-2 border">Shop</th>
                                    )}
                                    <th className="px-4 py-2 border">Product</th>
                                    <th className="px-4 py-2 border">Warehouse</th>
                                    <th className="px-4 py-2 border">Quantity</th>
                                    <th className="px-4 py-2 border">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-t hover:bg-gray-50 text-sm"
                                    >
                                        {isAdmin && (
                                            <td className="px-4 py-2 border text-gray-800">
                                                {invoice.shop?.name ||
                                                    invoice.shop?.email ||
                                                    "N/A"}
                                            </td>
                                        )}
                                        <td className="px-4 py-2 border text-gray-800">
                                            {invoice.request?.stock?.product?.name ||
                                                "N/A"}
                                        </td>
                                        <td className="px-4 py-2 border text-gray-800">
                                            {invoice.warehouse?.name || "N/A"}
                                        </td>
                                        <td className="px-4 py-2 border text-gray-800">
                                            {safeNumber(invoice.request?.quantity)}
                                        </td>
                                        <td className="px-4 py-2 border text-gray-800">
                                            KSh{" "}
                                            {safeNumber(invoice.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}

                                {/* Totals Row */}
                                <tr className="bg-gray-100 font-bold">
                                    <td
                                        className="px-4 py-2 border text-right"
                                        colSpan={isAdmin ? 3 : 2}
                                    >
                                        {selectedShop ? "Shop Total:" : "All Shops Total:"}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {filteredTotals.totalQuantity}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        KSh{" "}
                                        {filteredTotals.totalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
