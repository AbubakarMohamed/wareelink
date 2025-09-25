import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function ShopInvoicesIndex() {
    const { invoices, auth, flash } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

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
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Invoices" />

            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">My Invoices</h2>

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
                            <th className="px-4 py-2 border">Invoice #</th>
                            <th className="px-4 py-2 border">Product</th>
                            <th className="px-4 py-2 border">Warehouse</th>
                            <th className="px-4 py-2 border">Quantity</th>
                            <th className="px-4 py-2 border">Amount</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-4 py-2 border">#{invoice.id}</td>
                                    <td className="px-4 py-2 border">{invoice.request?.stock?.product?.name}</td>
                                    <td className="px-4 py-2 border">{invoice.warehouse?.name}</td>
                                    <td className="px-4 py-2 border">{invoice.request?.quantity}</td>
                                    <td className="px-4 py-2 border">KSh {Number(invoice.amount).toLocaleString()}</td>
                                    <td className="px-4 py-2 border capitalize">{invoice.status}</td>
                                    <td className="px-4 py-2 border text-center">
                                        {invoice.status === "unpaid" && (
                                            <button
                                                onClick={() => openModal(invoice)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                            >
                                                Pay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-2 border text-center text-gray-500">
                                    No invoices available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Headless UI Dialog */}
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
                                        Are you sure you want to pay invoice #{selectedInvoice?.id}?
                                    </Dialog.Description>

                                    <div className="mt-4 flex justify-end gap-2">
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
