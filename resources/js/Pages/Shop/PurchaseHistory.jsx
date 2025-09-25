import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";

export default function PurchaseHistory() {
    const { invoices, totalQuantity, totalAmount, auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Purchase History" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Purchase History</h2>

                {invoices.length === 0 ? (
                    <p className="text-gray-500">No purchase records available.</p>
                ) : (
                    <table className="min-w-full bg-white border rounded">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 border">Product</th>
                                <th className="px-4 py-2 border">Warehouse</th>
                                <th className="px-4 py-2 border">Quantity</th>
                                <th className="px-4 py-2 border">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="text-center">
                                    <td className="px-4 py-2 border">{invoice.request?.stock?.product?.name || "N/A"}</td>
                                    <td className="px-4 py-2 border">{invoice.warehouse?.name || "N/A"}</td>
                                    <td className="px-4 py-2 border">{invoice.request?.quantity || 0}</td>
                                    <td className="px-4 py-2 border">
                                        KSh {Number(invoice.amount || 0).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="px-4 py-2 border text-right" colSpan={2}>Totals:</td>
                                <td className="px-4 py-2 border">{totalQuantity}</td>
                                <td className="px-4 py-2 border">
                                    KSh {Number(totalAmount).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
