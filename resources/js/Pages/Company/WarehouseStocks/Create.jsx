import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Head, Link } from "@inertiajs/react";

export default function Create({ warehouses, products }) {
    const { data, setData, post, processing, errors } = useForm({
        warehouse_id: "",
        product_id: "",
        quantity: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("warehouse-stocks.store"));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Add Stock</h2>}
        >
            <Head title="Add Stock" />

            <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Warehouse Dropdown */}
                    <div>
                        <label className="block mb-1 font-medium">Warehouse</label>
                        <select
                            value={data.warehouse_id}
                            onChange={(e) => setData("warehouse_id", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">-- Select Warehouse --</option>
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>
                                    {wh.name}
                                </option>
                            ))}
                        </select>
                        {errors.warehouse_id && (
                            <p className="text-red-600 text-sm">{errors.warehouse_id}</p>
                        )}
                    </div>

                    {/* Product Dropdown */}
                    <div>
                        <label className="block mb-1 font-medium">Product</label>
                        <select
                            value={data.product_id}
                            onChange={(e) => setData("product_id", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku})
                                </option>
                            ))}
                        </select>
                        {errors.product_id && (
                            <p className="text-red-600 text-sm">{errors.product_id}</p>
                        )}
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block mb-1 font-medium">Quantity</label>
                        <input
                            type="number"
                            value={data.quantity}
                            onChange={(e) => setData("quantity", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.quantity && (
                            <p className="text-red-600 text-sm">{errors.quantity}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {processing ? "Saving..." : "Add Stock"}
                    </button>
                </form>

                <div className="mt-4">
                    <Link
                        href={route("warehouse-stocks.index")}
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Stocks
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
