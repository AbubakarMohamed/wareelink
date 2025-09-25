import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Create() {
    const { warehouses, auth } = usePage().props;

    const form = useForm({
        name: "",
        email: "",
        password: "",
        warehouse_id: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route("company.delivery-persons.store"));
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Create Delivery Person" />

            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow rounded">
                <div className="mb-4">
                    <label className="block mb-1 font-bold">Name</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData("name", e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    {form.errors.name && <div className="text-red-500">{form.errors.name}</div>}
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-bold">Email</label>
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData("email", e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    {form.errors.email && <div className="text-red-500">{form.errors.email}</div>}
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-bold">Password</label>
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData("password", e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    {form.errors.password && <div className="text-red-500">{form.errors.password}</div>}
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-bold">Warehouse</label>
                    <select
                        value={form.data.warehouse_id}
                        onChange={(e) => form.setData("warehouse_id", e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.id}>
                                {wh.name}
                            </option>
                        ))}
                    </select>
                    {form.errors.warehouse_id && <div className="text-red-500">{form.errors.warehouse_id}</div>}
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    {form.processing ? "Creating..." : "Create Delivery Person"}
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
