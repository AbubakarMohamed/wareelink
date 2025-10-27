import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function ShopInvoicesIndex() {
    const { invoices, auth, flash } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const isAdmin = auth.user?.role === "admin";

    const openModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedInvoice(null);
    };

    const handlePay = () => {
        if (selectedInvoice) {
            router.put(route("shop.invoices.pay", selectedInvoice.id));
        }
        closeModal();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {isAdmin ? "All Invoices" : "My Invoices"}
                </h2>
            }
        >
            <Head title={isAdmin ? "All Invoices" : "My Invoices"} />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                    {isAdmin ? "All Invoices" : "My Invoices"}
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

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded shadow-sm">
                        <thead>
                            <tr className="bg-gray-100 text-sm font-semibold text-gray-700">
                                <th className="px-4 py-2 border text-left">Invoice</th>
                                {isAdmin && (
                                    <th className="px-4 py-2 border text-left">Shop</th>
                                )}
                                <th className="px-4 py-2 border text-left">Product</th>
                                <th className="px-4 py-2 border text-left">Warehouse</th>
                                <th className="px-4 py-2 border text-left">Quantity</th>
                                <th className="px-4 py-2 border text-left">Amount</th>
                                <th className="px-4 py-2 border text-left">Status</th>
                                <th className="px-4 py-2 border text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-2 border">{invoice.id}</td>

                                        {/* ✅ Show Shop Column for Admin */}
                                        {isAdmin && (
                                            <td className="px-4 py-2 border">
                                                {invoice.shop?.name ||
                                                    invoice.shop?.email ||
                                                    "N/A"}
                                            </td>
                                        )}

                                        <td className="px-4 py-2 border">
                                            {invoice.request?.stock?.product?.name || "—"}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {invoice.warehouse?.name || "—"}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {invoice.request?.quantity || 0}
                                        </td>
                                        <td className="px-4 py-2 border font-medium">
                                            KSh {Number(invoice.amount).toLocaleString()}
                                        </td>
                                        <td
                                            className={`px-4 py-2 border capitalize ${
                                                invoice.status === "paid"
                                                    ? "text-green-600 font-semibold"
                                                    : "text-yellow-600 font-medium"
                                            }`}
                                        >
                                            {invoice.status}
                                        </td>
                                        <td className="px-4 py-2 border text-left">
                                            {invoice.status === "unpaid" ? (
                                                <button
                                                    onClick={() => openModal(invoice)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                                                >
                                                    Pay
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    Paid
                                                </span>
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
                                        No invoices available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Confirmation Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-full p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded shadow-lg">
                                    <Dialog.Title className="text-lg font-bold">
                                        Confirm Payment
                                    </Dialog.Title>
                                    <Dialog.Description className="mt-2 text-sm text-gray-500">
                                        Are you sure you want to pay invoice{" "}
                                        <strong>{selectedInvoice?.id}</strong>?
                                    </Dialog.Description>

                                    <div className="mt-5 flex justify-end gap-3">
                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePay}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Pay
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
