import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function RequestsIndex() {
    const { requests: initialRequests, auth, flash } = usePage().props;
    const [requests, setRequests] = useState(initialRequests);

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const handleAction = (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        router.put(
            route(`warehouse.requests.${action}`, id),
            {},
            {
                onSuccess: () => {
                    setRequests((prev) =>
                        prev.map((req) =>
                            req.id === id
                                ? { ...req, status: action === "approve" ? "approved" : "rejected" }
                                : req
                        )
                    );
                },
                onError: (errors) => {
                    alert(errors?.message || "Something went wrong");
                },
            }
        );
    };

    const handleInvoice = (id) => {
        setSelectedRequestId(id);
        setShowInvoiceModal(true);
    };

    const confirmInvoice = () => {
        if (!selectedRequestId) return;

        router.post(
            route("warehouse.invoices.store"),
            { request_id: selectedRequestId },
            {
                onSuccess: () => {
                    setRequests((prev) =>
                        prev.map((req) =>
                            req.id === selectedRequestId ? { ...req, status: "invoiced" } : req
                        )
                    );
                    setShowInvoiceModal(false);
                    setSelectedRequestId(null);
                },
                onError: (errors) => {
                    alert(errors?.message || "Failed to create invoice");
                },
            }
        );
    };

    const cancelInvoice = () => {
        setShowInvoiceModal(false);
        setSelectedRequestId(null);
    };

    const isAdmin = auth.user.role === "admin";

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Shop Requests</h2>}>
            <Head title="Shop Requests" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Shop Requests</h2>

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
                            <th className="px-4 py-2 border text-left">Shop</th>
                            <th className="px-4 py-2 border text-left">Performance</th> {/* ✅ new column */}
                            {isAdmin && <th className="px-4 py-2 border text-left">Company</th>}
                            <th className="px-4 py-2 border text-left">Product</th>
                            <th className="px-4 py-2 border text-left">Warehouse</th>
                            <th className="px-4 py-2 border text-left">Quantity</th>
                            <th className="px-4 py-2 border text-left">Status</th>
                            <th className="px-4 py-2 border text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2 border">{req.shop?.name}</td>
                                    <td className="px-4 py-2 border">
                                        {req.shop_performance != null ? `${req.shop_performance}%` : "N/A"}
                                    </td> {/* ✅ render performance */}
                                    {isAdmin && (
                                        <td className="px-4 py-2 border">
                                            {req.stock?.warehouse?.company?.name || "-"}
                                        </td>
                                    )}
                                    <td className="px-4 py-2 border">{req.stock?.product?.name}</td>
                                    <td className="px-4 py-2 border">{req.stock?.warehouse?.name}</td>
                                    <td className="px-4 py-2 border">{req.quantity}</td>
                                    <td className="px-4 py-2 border capitalize">{req.status}</td>
                                    <td className="px-4 py-2 border text-left">
                                        {req.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(req.id, "approve")}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "reject")}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {(req.status === "approved" || req.status === "invoiced") && (
                                            <button
                                                onClick={() => handleInvoice(req.id)}
                                                disabled={req.status === "invoiced"}
                                                className={`px-3 py-1 rounded text-white ${
                                                    req.status === "invoiced"
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-blue-600 hover:bg-blue-700"
                                                }`}
                                            >
                                                {req.status === "invoiced" ? "Invoice Created" : "Create Invoice"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 8 : 7} className="px-4 py-2 border text-center text-gray-500">
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showInvoiceModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Create Invoice</h2>
                        <p>Do you want to create an invoice for this request?</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={cancelInvoice}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmInvoice}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
