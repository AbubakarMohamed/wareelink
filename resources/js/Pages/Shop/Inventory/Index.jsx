import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Index() {
    const { stocks, auth, flash } = usePage().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentStock, setCurrentStock] = useState(null);
    const [quantity, setQuantity] = useState("");

    const handleRequest = (stockId, availableQty) => {
        setCurrentStock({ stockId, availableQty });
        setQuantity("");
        setIsDialogOpen(true);
    };

    const submitRequest = () => {
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert("Please enter a valid quantity."); // Can be replaced with toast later
            return;
        }
        if (quantity > currentStock.availableQty) {
            alert("Quantity exceeds available stock."); // Can be replaced with toast later
            return;
        }

        router.post(
            route("shop.requests.store"),
            { stock_id: currentStock.stockId, quantity },
            {
                onSuccess: () => {
                    alert("Request submitted successfully!");
                    setIsDialogOpen(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Shop Inventory" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Products Available for Request</h2>

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
                            <th className="px-4 py-2 border">Price</th>
                            <th className="px-4 py-2 border">Warehouse</th>
                            <th className="px-4 py-2 border">Location</th>
                            <th className="px-4 py-2 border">Company</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.length > 0 ? (
                            stocks.map((stock) => (
                                <tr key={stock.id}>
                                    <td className="px-4 py-2 border">{stock.product?.name}</td>
                                    <td className="px-4 py-2 border">
                                        {stock.product?.price
                                            ? `KSh ${Number(stock.product.price).toLocaleString()}`
                                            : "N/A"}
                                    </td>
                                    <td className="px-4 py-2 border">{stock.warehouse?.name}</td>
                                    <td className="px-4 py-2 border">{stock.warehouse?.location || "N/A"}</td>
                                    <td className="px-4 py-2 border">{stock.warehouse?.company?.name || "N/A"}</td>
                                    <td className="px-4 py-2 border">{stock.quantity}</td>
                                    <td className="px-4 py-2 border text-center">
                                        <button
                                            onClick={() => handleRequest(stock.id, stock.quantity)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                        >
                                            Request
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-2 border text-center text-gray-500">
                                    No stocks available for request.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Dialog */}
            <Transition appear show={isDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsDialogOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Enter Quantity
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Maximum available: {currentStock?.availableQty}
                                        </p>
                                        <input
                                            type="number"
                                            min="1"
                                            max={currentStock?.availableQty}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="mt-2 w-full border px-3 py-2 rounded"
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                            onClick={() => setIsDialogOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            onClick={submitRequest}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}
