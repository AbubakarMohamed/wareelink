import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { Fragment, useState, useMemo, useRef } from "react";
import { ListFilter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Index() {
    const { warehouses } = usePage().props;

    // Modal & Form States
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "add", "edit", "delete"
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    // Multi-warehouse form state
    const [warehousesForm, setWarehousesForm] = useState([
        { name: "", location: "", capacity: "", status: "active" },
    ]);

    // Single warehouse form for editing
    const [form, setForm] = useState({
        name: "",
        location: "",
        capacity: "",
        status: "active",
    });

    // Filters/Search/Pagination/Sorting states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showFilters, setShowFilters] = useState(false);
    const reference = useRef(null);
    const itemsPerPage = 5;

    // Open modal
    const openModal = (type, warehouse = null) => {
        setModalType(type);
        if (type === "edit" && warehouse) {
            setEditingWarehouse(warehouse);
            setForm({
                name: warehouse.name || "",
                location: warehouse.location || "",
                capacity: warehouse.capacity || "",
                status: warehouse.status || "active",
            });
        } else if (type === "add") {
            setEditingWarehouse(null);
            setWarehousesForm([{ name: "", location: "", capacity: "", status: "active" }]);
        } else if (type === "delete") {
            setEditingWarehouse(warehouse);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType("");
        setEditingWarehouse(null);
    };

    // Single warehouse change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Multi-warehouse change
    const handleWarehouseChange = (index, e) => {
        const { name, value } = e.target;
        const newWarehouses = [...warehousesForm];
        newWarehouses[index][name] = value;
        setWarehousesForm(newWarehouses);
    };

    const addWarehouseRow = () => {
        setWarehousesForm([...warehousesForm, { name: "", location: "", capacity: "", status: "active" }]);
    };

    const removeWarehouseRow = (index) => {
        const newWarehouses = warehousesForm.filter((_, i) => i !== index);
        setWarehousesForm(newWarehouses);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalType === "edit") {
            router.put(route("company.warehouses.update", editingWarehouse.id), form, {
                onSuccess: closeModal,
            });
        } else if (modalType === "add") {
            router.post(route("company.warehouses.storeMultiple"), { warehouses: warehousesForm }, {
                onSuccess: closeModal,
            });
        } else if (modalType === "delete") {
            router.delete(route("company.warehouses.destroy", editingWarehouse.id), {
                onSuccess: closeModal,
            });
        }
    };

    // 🔎 Filtering + Searching
    const filteredWarehouses = useMemo(() => {
        return warehouses.filter((w) => {
            const matchesSearch =
                w.name.toLowerCase().includes(search.toLowerCase()) ||
                w.location.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" ? true : w.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [warehouses, search, statusFilter]);

    // 🔀 Sorting
    const sortedWarehouses = useMemo(() => {
        let sortable = [...filteredWarehouses];
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
    }, [filteredWarehouses, sortConfig]);

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
    const totalPages = Math.ceil(sortedWarehouses.length / itemsPerPage);
    const paginatedWarehouses = sortedWarehouses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Export Excel
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sortedWarehouses);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouses");
        XLSX.writeFile(workbook, "warehouses.xlsx");
    };

    // Export PDF
    const exportPDF = () => {
        if (typeof window === "undefined") return;

        const doc = new jsPDF();
        const now = new Date().toLocaleString();
        doc.text("Warehouses Report", 14, 10);
        doc.setFontSize(10);
        doc.text(`Generated at: ${now}`, 14, 16);
        if (search) doc.text(`Search keyword: "${search}"`, 14, 22);
        if (statusFilter !== "all") doc.text(`Status filter: ${statusFilter}`, 14, 28);

        autoTable(doc, {
            startY: 40,
            head: [["#", "Name", "Location", "Capacity", "Status"]],
            body: sortedWarehouses.map((w, index) => [
                index + 1,
                w.name,
                w.location ?? "-",
                w.capacity ?? 0,
                w.status,
            ]),
        });

        doc.save("warehouses.pdf");
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Warehouses</h2>}>
            <Head title="Warehouses" />

            <div className="p-6 bg-white rounded shadow">
                {/* Header & Actions */}
                <div className="flex justify-between mb-4 items-center">
                    <h3 className="text-lg font-medium text-gray-700">All Warehouses</h3>
                    <div className="flex items-center gap-2">
                        <button ref={reference} onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200">
                            <ListFilter />
                        </button>
                        <button onClick={exportExcel} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export Excel</button>
                        <button onClick={exportPDF} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Export PDF</button>
                        <button onClick={() => openModal("add")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Warehouse</button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:gap-4">
                        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                )}

                {/* Warehouses Table */}
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("id")}># {getSortArrow("id")}</th>
                            <th className="p-2 border cursor-pointer text-left" onClick={() => requestSort("name")}>Name {getSortArrow("name")}</th>
                            <th className="p-2 border cursor-pointer">Location {getSortArrow("location")}</th>
                            <th className="p-2 border cursor-pointer">Capacity {getSortArrow("capacity")}</th>
                            <th className="p-2 border cursor-pointer">Status {getSortArrow("status")}</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedWarehouses.length > 0 ? (
                            paginatedWarehouses.map((warehouse, index) => (
                                <tr key={warehouse.id} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="p-2 border">{warehouse.name}</td>
                                    <td className="p-2 border text-center">{warehouse.location ?? "-"}</td>
                                    <td className="p-2 border text-center">{warehouse.capacity ?? 0}</td>
                                    <td className="p-2 border text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${warehouse.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {warehouse.status}
                                        </span>
                                    </td>
                                    <td className="p-2 border text-center">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="px-2 py-1 rounded hover:bg-gray-100">...</Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="opacity-100 scale-100"
                                                leaveTo="opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white border rounded shadow-lg focus:outline-none z-10">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button onClick={() => openModal("edit", warehouse)} className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm`}>Edit</button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button onClick={() => openModal("delete", warehouse)} className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-red-600`}>Delete</button>
                                                        )}
                                                    </Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">No warehouses found.</td>
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

            {/* Unified Modal for Add/Edit/Delete */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded shadow p-6 relative">
                                <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold">✕</button>

                                {modalType === "delete" ? (
                                    <>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">Delete Warehouse</Dialog.Title>
                                        <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete <strong>{editingWarehouse?.name}</strong>? This action cannot be undone.</p>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                            <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">{modalType === "edit" ? "Edit Warehouse" : "Add Warehouses"}</Dialog.Title>
                                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            {modalType === "add" ? (
                                                warehousesForm.map((w, index) => (
                                                    <div key={index} className="p-4 border rounded space-y-2 relative">
                                                        {warehousesForm.length > 1 && (
                                                            <button type="button" onClick={() => removeWarehouseRow(index)} className="absolute top-2 right-2 text-red-600 font-bold">×</button>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <input type="text" name="name" placeholder="Name" value={w.name} onChange={(e) => handleWarehouseChange(index, e)} className="px-3 py-2 border rounded w-full" required />
                                                            <input type="text" name="location" placeholder="Location" value={w.location} onChange={(e) => handleWarehouseChange(index, e)} className="px-3 py-2 border rounded w-full" />
                                                            <input type="number" name="capacity" placeholder="Capacity" value={w.capacity} onChange={(e) => handleWarehouseChange(index, e)} className="px-3 py-2 border rounded w-full" min="0" />
                                                            <select name="status" value={w.status} onChange={(e) => handleWarehouseChange(index, e)} className="px-3 py-2 border rounded w-full">
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="px-3 py-2 border rounded w-full" required />
                                                    <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="px-3 py-2 border rounded w-full" />
                                                    <input type="number" name="capacity" placeholder="Capacity" value={form.capacity} onChange={handleChange} className="px-3 py-2 border rounded w-full" min="0" />
                                                    <select name="status" value={form.status} onChange={handleChange} className="px-3 py-2 border rounded w-full">
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            )}
                                            {modalType === "add" && (
                                                <button type="button" onClick={addWarehouseRow} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add Another Warehouse</button>
                                            )}
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{modalType === "edit" ? "Update" : "Add"}</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}
