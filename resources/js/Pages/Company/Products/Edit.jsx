import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AuthService from "@/Services/AuthService";

export default function Edit() {
    const { product } = usePage().props;
    const [user, setUser] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        name: product?.name || "",
        sku: product?.sku || "",
        category: product?.category || "",
        description: product?.description || "",
        price: product?.price || 0.00,
        stock: product?.stock || 0,   // ✅ include stock
        status: product?.status || "active",
    });

    useEffect(() => {
        AuthService.getUser().then((fetchedUser) => {
            setUser(fetchedUser);
        });
    }, []);

    const submit = (e) => {
        e.preventDefault();
        put(route("company.products.update", product.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Product</h2>}
        >
            <Head title="Edit Product" />

            <form
                onSubmit={submit}
                className="p-6 bg-white rounded shadow max-w-lg mx-auto space-y-4"
            >
                {/* Name */}
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* SKU */}
                <div>
                    <label className="block mb-1 font-medium">SKU</label>
                    <input
                        type="text"
                        name="sku"
                        value={data.sku}
                        onChange={(e) => setData("sku", e.target.value)}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                    />
                    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                </div>

                {/* Category */}
                <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                    />
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                        rows="3"
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Price */}
                <div>
                    <label className="block mb-1 font-medium">Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                {/* Stock */}
                <div>
                    <label className="block mb-1 font-medium">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        min="0"
                        value={data.stock}
                        onChange={(e) => setData("stock", parseInt(e.target.value))}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                    />
                    {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>

                {/* Status */}
                <div>
                    <label className="block mb-1 font-medium">Status</label>
                    <select
                        name="status"
                        value={data.status}
                        onChange={(e) => setData("status", e.target.value)}
                        className="border rounded p-2 w-full focus:ring focus:border-indigo-500"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {processing ? "Updating..." : "Update"}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
