import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";

export default function Index() {
    const { shipments, invoices, auth, flash } = usePage().props;

    const createShipment = (invoiceId) => {
        if (confirm("Ship this invoice?")) {
            router.post(route("warehouse.shipments.store"), { invoice_id: invoiceId }, {
                onSuccess: () => router.reload()
            });
        }
    };

    // Combine shipments with unpaid shipments (from invoices)
    const allShipments = [
        ...shipments,
        ...invoices
            .filter(i => i.status === "paid" && !shipments.some(s => s.invoice_id === i.id))
            .map(i => ({
                id: `pending-${i.id}`, // fake ID for display
                invoice: i,
                shop: i.shop,
                quantity: i.request?.quantity,
                status: "pending"
            }))
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Shipments" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Shipments</h2>

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
                            <th className="px-4 py-2 border">Shipment #</th>
                            <th className="px-4 py-2 border">Invoice #</th>
                            <th className="px-4 py-2 border">Product</th>
                            <th className="px-4 py-2 border">Shop</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allShipments.length > 0 ? (
                            allShipments.map((shipment) => (
                                <tr key={shipment.id}>
                                    <td className="px-4 py-2 border">#{shipment.id}</td>
                                    <td className="px-4 py-2 border">#{shipment.invoice.id}</td>
                                    <td className="px-4 py-2 border">
                                        {shipment.invoice?.request?.stock?.product?.name}
                                    </td>
                                    <td className="px-4 py-2 border">{shipment.shop?.name}</td>
                                    <td className="px-4 py-2 border">{shipment.quantity}</td>
                                    <td className="px-4 py-2 border">{shipment.status}</td>
                                    <td className="px-4 py-2 border text-center">
                                        {shipment.invoice?.status === "paid" && shipment.status === "pending" ? (
                                            <button
                                                onClick={() => createShipment(shipment.invoice.id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                            >
                                                Ship
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-2 border text-center text-gray-500">
                                    No shipments available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
