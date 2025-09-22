import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { Fragment, useState } from "react";

export default function WarehouseAdminIndex({ warehouseAdmins: initialAdmins, warehouses, auth }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [admins, setAdmins] = useState(initialAdmins);

    const form = useForm({
        name: "",
        email: "",
        password: "",
        warehouse_id: "",
    });

    // Open Add/Edit Modal
    const openModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            form.setData({
                name: admin.user?.name || "",
                email: admin.user?.email || "",
                password: "",
                warehouse_id: admin.warehouse?.id || "",
            });
        } else {
            setEditingAdmin(null);
            form.reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAdmin(null);
        form.reset();
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingAdmin) {
            form.put(route("company.warehouse-admins.update", editingAdmin.user.id), {
                onSuccess: ({ props }) => {
                    // Update table instantly
                    const updatedAdmin = props.warehouseAdmins.find(a => a.id === editingAdmin.id);
                    setAdmins(admins.map(a => (a.id === editingAdmin.id ? updatedAdmin : a)));
                    closeModal();
                },
            });
        } else {
            form.post(route("company.warehouse-admins.store"), {
                onSuccess: ({ props }) => {
                    // Add new admin to table
                    const newAdmin = props.warehouseAdmins[props.warehouseAdmins.length - 1];
                    setAdmins([...admins, newAdmin]);
                    closeModal();
                },
            });
        }
    };

    // Delete admin
    const openDeleteModal = (admin) => {
        setDeleteId(admin.user.id);
        setDeleteOpen(true);
    };
    const closeDeleteModal = () => {
        setDeleteId(null);
        setDeleteOpen(false);
    };
    const handleDelete = () => {
        form.delete(route("company.warehouse-admins.destroy", deleteId), {
            onSuccess: ({ props }) => {
                setAdmins(admins.filter(a => a.user.id !== deleteId));
                closeDeleteModal();
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Warehouse Admins</h2>}>
            <Head title="Warehouse Admins" />

            {/* Table & buttons */}
            <div className="p-6 bg-white rounded shadow max-w-5xl mx-auto mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">All Warehouse Admins</h3>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded">
                        + Add Admin
                    </button>
                </div>

                {admins.length === 0 ? (
                    <p>No warehouse admins found.</p>
                ) : (
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">#</th>
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Warehouse</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin, index) => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="p-2 border">{index + 1}</td>
                                    <td className="p-2 border">{admin.user?.name}</td>
                                    <td className="p-2 border">{admin.user?.email}</td>
                                    <td className="p-2 border">{admin.warehouse?.name}</td>
                                    <td className="p-2 border">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="px-2 py-1 rounded">...</Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="opacity-0 scale-95"
                                                enterTo="opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="opacity-100 scale-100"
                                                leaveTo="opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-10">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button onClick={() => openModal(admin)} className={`${active && "bg-gray-100"} block w-full text-left px-4 py-2`}>
                                                                Edit
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button onClick={() => openDeleteModal(admin)} className={`${active && "bg-gray-100"} block w-full text-left px-4 py-2 text-red-600`}>
                                                                Delete
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
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

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg bg-white rounded shadow p-6 relative">
                                <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold">✕</button>
                                <Dialog.Title className="text-lg font-medium mb-4">{editingAdmin ? "Edit Admin" : "Add Admin"}</Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Name</label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData("name", e.target.value)}
                                            className="mt-1 block w-full border rounded px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(e) => form.setData("email", e.target.value)}
                                            className="mt-1 block w-full border rounded px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">{editingAdmin ? "New Password (leave blank to keep current)" : "Password"}</label>
                                        <input
                                            type="password"
                                            value={form.data.password}
                                            onChange={(e) => form.setData("password", e.target.value)}
                                            className="mt-1 block w-full border rounded px-3 py-2"
                                            {...(!editingAdmin && { required: true })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Assigned Warehouse</label>
                                        <select
                                            value={form.data.warehouse_id}
                                            onChange={(e) => form.setData("warehouse_id", e.target.value)}
                                            className="mt-1 block w-full border rounded px-3 py-2"
                                            required
                                        >
                                            <option value="">Select warehouse</option>
                                            {warehouses.map((w) => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{editingAdmin ? "Update" : "Add"}</button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Modal */}
            <Transition appear show={isDeleteOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeDeleteModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md bg-white rounded shadow p-6">
                                <Dialog.Title className="text-lg font-medium mb-4">Delete Admin</Dialog.Title>
                                <p>Are you sure you want to delete this admin?</p>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                    <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}