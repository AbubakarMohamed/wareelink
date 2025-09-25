import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";

export default function Index() {
    const { requests, auth, flash } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Requests" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">My Product Requests</h2>

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
                            <th className="px-4 py-2 border">Warehouse</th>
                            <th className="px-4 py-2 border">Company</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Requested At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-2 border">
                                        {req.stock?.product?.name}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {req.stock?.warehouse?.name}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {req.stock?.warehouse?.company?.name}
                                    </td>
                                    <td className="px-4 py-2 border">{req.quantity}</td>
                                    <td className="px-4 py-2 border">
                                        {req.status === "pending" && (
                                            <span className="text-yellow-600 font-semibold">Pending</span>
                                        )}
                                        {req.status === "approved" && (
                                            <span className="text-green-600 font-semibold">Approved</span>
                                        )}
                                        {req.status === "rejected" && (
                                            <span className="text-red-600 font-semibold">Rejected</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {new Date(req.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-4 py-2 border text-center text-gray-500"
                                >
                                    You haven’t submitted any requests yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
