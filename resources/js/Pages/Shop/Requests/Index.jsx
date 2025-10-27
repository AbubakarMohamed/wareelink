import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";

export default function Index() {
    const { requests, auth, flash } = usePage().props;
    const isAdmin = auth.user.role === "admin";

    const handleCancel = (id) => {
        if (confirm("Are you sure you want to cancel this request?")) {
            router.post(`/shop/requestss/${id}/cancel`);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {isAdmin ? "All Shop Requests" : "My Requests"}
                </h2>
            }
        >
            <Head title={isAdmin ? "All Requests" : "My Requests"} />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                    {isAdmin ? "Shop Product Requests" : "My Product Requests"}
                </h2>

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
                            {isAdmin && (
                                <th className="px-4 py-2 border text-left">Shop</th>
                            )}
                            <th className="px-4 py-2 border text-left">Product</th>
                            <th className="px-4 py-2 border text-left">Warehouse</th>
                            <th className="px-4 py-2 border text-left">Company</th>
                            <th className="px-4 py-2 border text-left">Quantity</th>
                            <th className="px-4 py-2 border text-left">Status</th>
                            <th className="px-4 py-2 border text-left">Requested At</th>
                            <th className="px-4 py-2 border text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <tr key={req.id}>
                                    {isAdmin && (
                                        <td className="px-4 py-2 border">
                                            {req.shop?.name || "N/A"}
                                        </td>
                                    )}
                                    <td className="px-4 py-2 border">
                                        {req.stock?.product?.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {req.stock?.warehouse?.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {req.stock?.warehouse?.company?.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 border">{req.quantity}</td>
                                    <td className="px-4 py-2 border">
                                        {req.status === "pending" && (
                                            <span className="text-yellow-600 font-semibold">
                                                Pending
                                            </span>
                                        )}
                                        {req.status === "approved" && (
                                            <span className="text-green-600 font-semibold">
                                                Approved
                                            </span>
                                        )}
                                        {req.status === "rejected" && (
                                            <span className="text-red-600 font-semibold">
                                                Rejected
                                            </span>
                                        )}
                                        {req.status === "cancelled" && (
                                            <span className="text-gray-600 font-semibold">
                                                Cancelled
                                            </span>
                                        )}
                                        {req.status === "invoiced" && (
                                            <span className="text-blue-600 font-semibold">
                                                Invoiced
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {new Date(req.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 border text-left">
                                        {req.status === "pending" ? (
                                            <button
                                                onClick={() => handleCancel(req.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                            >
                                                Cancel
                                            </button>
                                        ) : req.status === "cancelled" ? (
                                            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded cursor-not-allowed">
                                                Cancelled
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={isAdmin ? 8 : 7}
                                    className="px-4 py-2 border text-center text-gray-500"
                                >
                                    {isAdmin
                                        ? "No shop requests found."
                                        : "You haven’t submitted any requests yet."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
