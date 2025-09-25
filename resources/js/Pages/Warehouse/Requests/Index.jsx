import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function RequestsIndex() {
    const { requests: initialRequests, auth, flash } = usePage().props;
    const [requests, setRequests] = useState(initialRequests);

    const handleAction = (id, action) => {
        if (confirm(`Are you sure you want to ${action} this request?`)) {
            router.put(
                route(`warehouse.requests.${action}`, id),
                {},
                {
                    onSuccess: () => {
                        alert(`Request ${action}ed successfully!`);
                        setRequests((prev) =>
                            prev.map((req) =>
                                req.id === id
                                    ? { ...req, status: action === "approve" ? "approved" : "rejected" }
                                    : req
                            )
                        );
                    },
                }
            );
        }
    };

    const handleInvoice = (id) => {
        if (confirm("Do you want to create an invoice for this request?")) {
            router.post(
                route("warehouse.invoices.store"),
                { request_id: id },
                {
                    onSuccess: () => {
                        alert("Invoice created successfully!");
                        // Update the request status locally
                        setRequests((prev) =>
                            prev.map((req) =>
                                req.id === id ? { ...req, status: "invoiced" } : req
                            )
                        );
                    },
                }
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
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
                            <th className="px-4 py-2 border">Shop</th>
                            <th className="px-4 py-2 border">Product</th>
                            <th className="px-4 py-2 border">Warehouse</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2 border">{req.shop?.name}</td>
                                    <td className="px-4 py-2 border">{req.stock?.product?.name}</td>
                                    <td className="px-4 py-2 border">{req.stock?.warehouse?.name}</td>
                                    <td className="px-4 py-2 border">{req.quantity}</td>
                                    <td className="px-4 py-2 border capitalize">{req.status}</td>
                                    <td className="px-4 py-2 border text-center">
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
                                <td
                                    colSpan="6"
                                    className="px-4 py-2 border text-center text-gray-500"
                                >
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
