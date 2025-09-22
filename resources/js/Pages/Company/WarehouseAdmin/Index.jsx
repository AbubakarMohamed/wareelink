import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage, useForm } from "@inertiajs/react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { Fragment, useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ListFilter } from "lucide-react";

export default function WarehouseAdminIndex({ warehouseAdmins: initialAdmins, warehouses, auth }) {
    const [admins, setAdmins] = useState(initialAdmins);

    // Modal states
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Filters/Search/Sorting/Pagination
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 5;
    const reference = useRef(null);

    // Multi-admin add form
    const [adminsForm, setAdminsForm] = useState([
        { name: "", email: "", password: "", warehouse_id: "" },
    ]);

    // Single admin form
    const form = useForm({
        name: "",
        email: "",
        password: "",
        warehouse_id: "",
    });

    // Open modal
    const openModalFunc = (type, admin = null) => {
        setModalType(type);
        if (type === "edit" && admin) {
            setEditingAdmin(admin);
            form.setData({
                name: admin.user?.name || "",
                email: admin.user?.email || "",
                password: "",
                warehouse_id: admin.warehouse?.id || "",
            });
        } else if (type === "add") {
            setEditingAdmin(null);
            setAdminsForm([{ name: "", email: "", password: "", warehouse_id: "" }]);
        } else if (type === "delete" && admin) {
            setDeleteId(admin.id);
            setDeleteOpen(true);
        }
        if (type !== "delete") setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingAdmin(null);
        form.reset();
    };

    const closeDeleteModal = () => {
        setDeleteId(null);
        setDeleteOpen(false);
    };

    // Multi-admin form change
    const handleAdminChange = (index, e) => {
        const { name, value } = e.target;
        const newAdmins = [...adminsForm];
        newAdmins[index][name] = value;
        setAdminsForm(newAdmins);
    };

    const addAdminRow = () => {
        setAdminsForm([...adminsForm, { name: "", email: "", password: "", warehouse_id: "" }]);
    };

    const removeAdminRow = (index) => {
        const newAdmins = adminsForm.filter((_, i) => i !== index);
        setAdminsForm(newAdmins);
    };

    // Submit Add/Edit/Delete
    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalType === "edit") {
            form.put(route("company.warehouse-admins.update", editingAdmin.id), {
                onSuccess: ({ props }) => {
                    const updatedAdmin = props.warehouseAdmins.find(a => a.id === editingAdmin.id);
                    setAdmins(admins.map(a => (a.id === editingAdmin.id ? updatedAdmin : a)));
                    closeModal();
                },
            });
        } else if (modalType === "add") {
            router.post(route("company.warehouse-admins.storeMultiple"), { admins: adminsForm }, {
                onSuccess: ({ props }) => {
                    const newAdmins = props.warehouseAdmins.slice(-adminsForm.length);
                    setAdmins([...admins, ...newAdmins]);
                    closeModal();
                },
            });
        }
    };

    const handleDelete = () => {
        form.delete(route("company.warehouse-admins.destroy", deleteId), {
            onSuccess: ({ props }) => {
                setAdmins(admins.filter(a => a.id !== deleteId));
                closeDeleteModal();
            },
        });
    };

    // Filtering + Searching
    const filteredAdmins = useMemo(() => {
        return admins.filter(a => {
            const matchesSearch =
                a.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                a.user?.email.toLowerCase().includes(search.toLowerCase()) ||
                a.warehouse?.name.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        });
    }, [admins, search]);

    // Sorting
    const sortedAdmins = useMemo(() => {
        let sortable = [...filteredAdmins];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                const aVal = a[sortConfig.key] ?? "";
                const bVal = b[sortConfig.key] ?? "";
                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [filteredAdmins, sortConfig]);

    const requestSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key && prev.direction === "asc") return { key, direction: "desc" };
            return { key, direction: "asc" };
        });
    };

    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return "↑↓";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };

    // Pagination
    const totalPages = Math.ceil(sortedAdmins.length / itemsPerPage);
    const paginatedAdmins = sortedAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Export Excel
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sortedAdmins.map(a => ({
            Name: a.user?.name,
            Email: a.user?.email,
            Warehouse: a.warehouse?.name,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "WarehouseAdmins");
        XLSX.writeFile(workbook, "warehouse_admins.xlsx");
    };

    // Export PDF
    const exportPDF = () => {
        if (typeof window === "undefined") return;
        const doc = new jsPDF();
        const now = new Date().toLocaleString();
        doc.text("Warehouse Admins Report", 14, 10);
        doc.setFontSize(10);
        doc.text(`Generated at: ${now}`, 14, 16);
        if (search) doc.text(`Search keyword: "${search}"`, 14, 22);

        autoTable(doc, {
            startY: 30,
            head: [["#", "Name", "Email", "Warehouse"]],
            body: sortedAdmins.map((a, index) => [
                index + 1,
                a.user?.name,
                a.user?.email,
                a.warehouse?.name ?? "-",
            ]),
        });

        doc.save("warehouse_admins.pdf");
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Warehouse Admins</h2>}>
            <Head title="Warehouse Admins" />

            <div className="p-6 bg-white rounded shadow max-w-6xl mx-auto mt-6">
                {/* Header & Actions */}
                <div className="flex justify-between mb-4 items-center">
                    <h3 className="text-lg font-medium text-gray-700">All Warehouse Admins</h3>
                    <div className="flex items-center gap-2">
                        <button ref={reference} onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200">
                            <ListFilter />
                        </button>
                        <button onClick={exportExcel} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export Excel</button>
                        <button onClick={exportPDF} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Export PDF</button>
                        <button onClick={() => openModalFunc("add")} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">+ Add Admin</button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:gap-4">
                        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto" />
                    </div>
                )}

                {/* Admins Table */}
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("id")}># {getSortArrow("id")}</th>
                            <th className="p-2 border cursor-pointer text-left" onClick={() => requestSort("user.name")}>Name {getSortArrow("user.name")}</th>
                            <th className="p-2 border cursor-pointer text-left" onClick={() => requestSort("user.email")}>Email {getSortArrow("user.email")}</th>
                            <th className="p-2 border cursor-pointer text-left" onClick={() => requestSort("warehouse.name")}>Warehouse {getSortArrow("warehouse.name")}</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAdmins.length > 0 ? (
                            paginatedAdmins.map((admin, index) => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="p-2 border">{admin.user?.name}</td>
                                    <td className="p-2 border">{admin.user?.email}</td>
                                    <td className="p-2 border">{admin.warehouse?.name}</td>
                                    <td className="p-2 border text-center">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="px-2 py-1 rounded hover:bg-gray-100">...</Menu.Button>
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
                                                    <Menu.Item>{({ active }) => (
                                                        <button onClick={() => openModalFunc("edit", admin)} className={`${active && "bg-gray-100"} block w-full text-left px-4 py-2`}>Edit</button>
                                                    )}</Menu.Item>
                                                    <Menu.Item>{({ active }) => (
                                                        <button onClick={() => openModalFunc("delete", admin)} className={`${active && "bg-gray-100"} block w-full text-left px-4 py-2 text-red-600`}>Delete</button>
                                                    )}</Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">No admins found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">Page {currentPage} of {totalPages || 1}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded shadow p-6 relative">
                                <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold">✕</button>

                                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                                    {modalType === "edit" ? "Edit Admin" : "Add Warehouse Admins"}
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {modalType === "add" ? (
                                        adminsForm.map((adm, index) => (
                                            <div key={index} className="p-4 border rounded space-y-2 relative">
                                                {adminsForm.length > 1 && (
                                                    <button type="button" onClick={() => removeAdminRow(index)} className="absolute top-2 right-2 text-red-600 font-bold">×</button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <input type="text" name="name" placeholder="Name" value={adm.name} onChange={(e) => handleAdminChange(index, e)} className="px-3 py-2 border rounded w-full" required />
                                                    <input type="email" name="email" placeholder="Email" value={adm.email} onChange={(e) => handleAdminChange(index, e)} className="px-3 py-2 border rounded w-full" required />
                                                    <input type="password" name="password" placeholder="Password" value={adm.password} onChange={(e) => handleAdminChange(index, e)} className="px-3 py-2 border rounded w-full" required />
                                                    <select name="warehouse_id" value={adm.warehouse_id} onChange={(e) => handleAdminChange(index, e)} className="px-3 py-2 border rounded w-full" required>
                                                        <option value="">Select warehouse</option>
                                                        {warehouses.map((w) => (
                                                            <option key={w.id} value={w.id}>{w.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium">Name</label>
                                                <input type="text" value={form.data.name} onChange={e => form.setData("name", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">Email</label>
                                                <input type="email" value={form.data.email} onChange={e => form.setData("email", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">{editingAdmin ? "New Password (leave blank to keep current)" : "Password"}</label>
                                                <input type="password" value={form.data.password} onChange={e => form.setData("password", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" {...(!editingAdmin && { required: true })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">Assigned Warehouse</label>
                                                <select value={form.data.warehouse_id} onChange={e => form.setData("warehouse_id", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" required>
                                                    <option value="">Select warehouse</option>
                                                    {warehouses.map((w) => (
                                                        <option key={w.id} value={w.id}>{w.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {modalType === "add" && (
                                        <button type="button" onClick={addAdminRow} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add Another Admin</button>
                                    )}

                                    <div className="flex justify-end gap-2 mt-2">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{modalType === "edit" ? "Update" : "Add"}</button>
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
