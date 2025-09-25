import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";

export default function Index() {
    const { invoices, auth, flash } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Invoices" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Invoices</h2>

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
                            <th className="px-4 py-2 border">Invoice #</th>
                            <th className="px-4 py-2 border">Product</th>
                            <th className="px-4 py-2 border">Shop</th>
                            <th className="px-4 py-2 border">Warehouse</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Amount</th>
                            <th className="px-4 py-2 border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-4 py-2 border">#{invoice.id}</td>
                                    <td className="px-4 py-2 border">
                                        {invoice.request?.stock?.product?.name}
                                    </td>
                                    <td className="px-4 py-2 border">{invoice.shop?.name || "N/A"}</td>
                                    <td className="px-4 py-2 border">{invoice.warehouse?.name}</td>
                                    <td className="px-4 py-2 border">{invoice.request?.quantity}</td>
                                    <td className="px-4 py-2 border">
                                        KSh {Number(invoice.amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 border">{invoice.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-2 border text-center text-gray-500">
                                    No invoices available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
