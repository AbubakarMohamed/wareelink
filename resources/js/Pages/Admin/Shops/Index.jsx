import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ shops }) {
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this shop?")) {
            router.delete(route("admin.shops.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold">Manage Shops</h2>}
        >
            <Head title="Shops" />
            <div className="p-6 bg-white shadow rounded-lg">
                <Link
                    href={route("admin.shops.create")}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    + Add Shop
                </Link>

                <table className="min-w-full mt-4 border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shops.map((shop) => (
                            <tr key={shop.id}>
                                <td className="p-2 border">{shop.id}</td>
                                <td className="p-2 border">{shop.name}</td>
                                <td className="p-2 border space-x-2">
                                    <Link
                                        href={route("admin.shops.edit", shop.id)}
                                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(shop.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
