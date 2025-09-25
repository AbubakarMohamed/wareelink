import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";

export default function WarehouseReport() {
    const { invoices, auth, flash } = usePage().props;

    // Only consider paid invoices
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');

    // Calculate grand totals for paid invoices
    const grandTotalQuantity = paidInvoices.reduce((sum, inv) => sum + (inv.request?.quantity || 0), 0);
    const grandTotalAmount = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Warehouse Report" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Warehouse Sales Report (Paid Invoices)</h2>

                {flash.success && (
                    <div className="bg-green-100 text-green-800 p-2 rounded mb-4">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
                        {flash.error}
                    </div>
                )}

                <table className="min-w-full bg-white border rounded">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">Product</th>
                            <th className="px-4 py-2 border">Shop</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Amount (KSh)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paidInvoices.length > 0 ? (
                            paidInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-4 py-2 border">
                                        {invoice.request?.stock?.product?.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 border">{invoice.shop?.name || "N/A"}</td>
                                    <td className="px-4 py-2 border">{invoice.request?.quantity || 0}</td>
                                    <td className="px-4 py-2 border">
                                        KSh {Number(invoice.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-2 border text-center text-gray-500">
                                    No paid invoices available.
                                </td>
                            </tr>
                        )}
                        {/* Grand total row */}
                        <tr className="font-bold bg-gray-100">
                            <td className="px-4 py-2 border text-right" colSpan={2}>Total:</td>
                            <td className="px-4 py-2 border">{grandTotalQuantity}</td>
                            <td className="px-4 py-2 border">
                                KSh {grandTotalAmount.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
