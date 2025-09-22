import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function WarehouseAdminCreate({ warehouses, auth }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        warehouse_id: warehouses[0]?.id || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        form.post(route("warehouse-admins.store"), {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Add Warehouse Admin</h2>}
        >
            <Head title="Add Warehouse Admin" />

            <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData("name", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                        {form.errors.name && <p className="text-red-600 text-sm">{form.errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData("email", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                        {form.errors.email && <p className="text-red-600 text-sm">{form.errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData("password", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                        {form.errors.password && <p className="text-red-600 text-sm">{form.errors.password}</p>}
                    </div>

                    {/* Password Confirmation */}
                    <div>
                        <label className="block text-sm font-medium">Confirm Password</label>
                        <input
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData("password_confirmation", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium">Phone (Optional)</label>
                        <input
                            type="text"
                            value={form.data.phone}
                            onChange={(e) => form.setData("phone", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    {/* Warehouse */}
                    <div>
                        <label className="block text-sm font-medium">Assign Warehouse</label>
                        <select
                            value={form.data.warehouse_id}
                            onChange={(e) => form.setData("warehouse_id", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        >
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>
                                    {wh.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.warehouse_id && (
                            <p className="text-red-600 text-sm">{form.errors.warehouse_id}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Admin"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
