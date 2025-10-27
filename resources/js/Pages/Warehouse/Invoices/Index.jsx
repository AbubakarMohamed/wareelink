import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";

export default function Index() {
    const { invoices, auth, flash } = usePage().props;
    const isAdmin = auth.user.role === 'admin'; // ✅ check if admin

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="text-xl font-semibold text-gray-800">Invoices</h2>}
        >
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
                            <th className="px-4 py-2 border text-left">Invoice</th>
                            <th className="px-4 py-2 border text-left">Product</th>
                            <th className="px-4 py-2 border text-left">Shop</th>
                            <th className="px-4 py-2 border text-left">Warehouse</th>
                            {isAdmin && <th className="px-4 py-2 border text-left">Company</th>} {/* ✅ Company column for admin */}
                            <th className="px-4 py-2 border text-left">Quantity</th>
                            <th className="px-4 py-2 border text-left">Amount</th>
                            <th className="px-4 py-2 border text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-4 py-2 border">{invoice.id}</td>
                                    <td className="px-4 py-2 border">
                                        {invoice.request?.stock?.product?.name}
                                    </td>
                                    <td className="px-4 py-2 border">{invoice.shop?.name || "N/A"}</td>
                                    <td className="px-4 py-2 border">{invoice.warehouse?.name}</td>
                                    {isAdmin && (
                                        <td className="px-4 py-2 border">
                                            {invoice.company?.name || "N/A"}
                                        </td>
                                    )}
                                    <td className="px-4 py-2 border">{invoice.request?.quantity}</td>
                                    <td className="px-4 py-2 border">
                                        KSh {Number(invoice.amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 border">{invoice.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 8 : 7} className="px-4 py-2 border text-center text-gray-500">
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
