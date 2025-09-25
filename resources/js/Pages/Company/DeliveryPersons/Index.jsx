import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router, useForm } from "@inertiajs/react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Index() {
    const { deliveryPersons, warehouses, auth, flash } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const openModal = (deliveryPerson = null) => {
        setEditData(deliveryPerson);
        setIsOpen(true);
    };

    const closeModal = () => {
        setEditData(null);
        setIsOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this delivery person?")) {
            router.delete(route("company.delivery-persons.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout user={auth}>
            <Head title="Delivery Persons" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Delivery Persons</h2>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
                    >
                        Add Delivery Person
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                        {flash.success}
                    </div>
                )}

                <table className="w-full border border-gray-200 rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">#</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Phone</th>
                            <th className="p-2 border">Warehouse</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveryPersons.map((dp, i) => (
                            <tr key={dp.id} className="text-center">
                                <td className="p-2 border">{i + 1}</td>
                                <td className="p-2 border">{dp.user?.name}</td>
                                <td className="p-2 border">{dp.user?.email}</td>
                                <td className="p-2 border">{dp.phone}</td>
                                <td className="p-2 border">
                                    {dp.warehouse?.name || "—"}
                                </td>
                                <td className="p-2 border">
                                    <span
                                        className={`px-2 py-1 rounded ${
                                            dp.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {dp.status}
                                    </span>
                                </td>
                                <td className="p-2 border space-x-2">
                                    <button
                                        onClick={() => openModal(dp)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dp.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
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
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center">
                        <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                            <Dialog.Title className="text-lg font-bold mb-4">
                                {editData ? "Edit Delivery Person" : "Add Delivery Person"}
                            </Dialog.Title>

                            <DeliveryPersonForm
                                closeModal={closeModal}
                                warehouses={warehouses}
                                deliveryPerson={editData}
                            />
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}

function DeliveryPersonForm({ closeModal, warehouses, deliveryPerson }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: deliveryPerson?.user?.name || "",
        email: deliveryPerson?.user?.email || "",
        phone: deliveryPerson?.phone || "",
        password: "",
        warehouse_id: deliveryPerson?.warehouse_id || "",
        status: deliveryPerson?.status || "active",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (deliveryPerson) {
            put(route("company.delivery-persons.update", deliveryPerson.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("company.delivery-persons.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            {!deliveryPerson && (
                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                    {errors.password && (
                        <p className="text-red-600 text-sm">{errors.password}</p>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium">Warehouse</label>
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

            {deliveryPerson && (
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                        value={data.status}
                        onChange={(e) => setData("status", e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && (
                        <p className="text-red-600 text-sm">{errors.status}</p>
                    )}
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    {deliveryPerson ? "Update" : "Save"}
                </button>
            </div>
        </form>
    );
}
