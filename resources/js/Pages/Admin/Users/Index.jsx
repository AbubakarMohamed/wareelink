import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Index({ users, flash }) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // ✅ Dialogs & Form State
    const [modal, setModal] = useState({
        isOpen: false,
        type: "", // "add" | "edit" | "delete"
        user: null,
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        company_id: "",
        warehouse_id: "",
    });

    const [companies, setCompanies] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // ✅ Fetch companies when role changes
    useEffect(() => {
        if (formData.role === "warehouse_admin") {
            fetch("/api/companies")
                .then((res) => res.json())
                .then((data) => setCompanies(data))
                .catch((err) => console.error("Error fetching companies:", err));
        }
    }, [formData.role]);

    // ✅ Fetch warehouses when company is selected
    useEffect(() => {
        if (formData.role === "warehouse_admin" && formData.company_id) {
            fetch(`/api/companies/${formData.company_id}/warehouses`)
                .then((res) => res.json())
                .then((data) => setWarehouses(data))
                .catch((err) => console.error("Error fetching warehouses:", err));
        } else {
            setWarehouses([]);
        }
    }, [formData.role, formData.company_id]);

    // ✅ Filtered Users
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // ✅ Table Config
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("id", { header: "ID" }),
        columnHelper.accessor("name", { header: "Name" }),
        columnHelper.accessor("email", { header: "Email" }),
        columnHelper.accessor("role", {
            header: "Role",
            cell: (info) => (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: (info) => (
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-2 rounded-full hover:bg-gray-100">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                    </Menu.Button>
                    <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg focus:outline-none z-10">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => openModal("edit", info.row.original)}
                                            className={`${
                                                active ? "bg-gray-100" : ""
                                            } w-full text-left px-4 py-2 text-sm text-gray-700`}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => openModal("delete", info.row.original)}
                                            className={`${
                                                active ? "bg-gray-100" : ""
                                            } w-full text-left px-4 py-2 text-sm text-red-600`}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ),
        }),
    ];

    const table = useReactTable({
        data: filteredUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // ✅ Modal Handlers
    const openModal = (type, user = null) => {
        setModal({ isOpen: true, type, user });
        if (type === "edit" && user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: "",
                role: user.role,
                company_id: user.company_id || "",
                warehouse_id: user.warehouse_id || "",
            });
        } else if (type === "add") {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "",
                company_id: "",
                warehouse_id: "",
            });
        }
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: "", user: null });
    };

    // ✅ CRUD
    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("admin.users.store"), formData, {
            onSuccess: closeModal,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        router.put(route("admin.users.update", modal.user.id), formData, {
            onSuccess: closeModal,
        });
    };

    const handleDelete = () => {
        router.delete(route("admin.users.destroy", modal.user.id), {
            onSuccess: closeModal,
        });
    };

    // ✅ Export
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "users.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Users Report", 14, 10);
        autoTable(doc, {
            startY: 20,
            head: [["ID", "Name", "Email", "Role"]],
            body: filteredUsers.map((u) => [u.id, u.name, u.email, u.role]),
        });
        doc.save("users.pdf");
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold leading-tight text-gray-800">Manage Users</h2>}
        >
            <Head title="Users" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 ">
                    <div className="bg-white shadow rounded-lg overflow-hidden p-4">
                        {/* ✅ Controls */}
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-3 py-2 border rounded w-1/3"
                            />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border rounded"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="company">Company</option>
                                <option value="warehouse_admin">Warehouse Admin</option>
                                <option value="shop">Shop</option>
                            </select>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => table.setPageSize(Number(e.target.value))}
                                className="border rounded px-2 py-1"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        Show {size}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={exportToExcel} className="px-3 py-2 bg-green-500 text-white rounded">
                                    Export Excel
                                </button>
                                <button onClick={exportToPDF} className="px-3 py-2 bg-red-500 text-white rounded">
                                    Export PDF
                                </button>
                                <button
                                    onClick={() => openModal("add")}
                                    className="px-3 py-2 bg-blue-500 text-white rounded"
                                >
                                    + Add User
                                </button>
                            </div>
                        </div>

                        {/* ✅ Table */}
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map((hg) => (
                                    <tr key={hg.id}>
                                        {hg.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-sm font-semibold text-gray-600 border-b"
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-4 text-center text-sm text-gray-500"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center px-6 py-3">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Reusable Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
                        {/* X Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        {modal.type === "add" && (
                            <>
                                <h3 className="text-lg font-bold mb-4">Add User</h3>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    {renderFormFields()}
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {modal.type === "edit" && (
                            <>
                                <h3 className="text-lg font-bold mb-4">Edit User</h3>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    {renderFormFields(true)}
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {modal.type === "delete" && (
                            <>
                                <h3 className="text-lg font-bold mb-4 text-red-600">Confirm Delete</h3>
                                <p className="mb-6 text-gray-600">
                                    Are you sure you want to delete{" "}
                                    <strong>{modal.user?.name}</strong>?
                                </p>
                                <div className="flex justify-end gap-2">
                                    <button onClick={closeModal} className="px-4 py-2 border rounded">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );

    // ✅ Shared Form Fields Renderer
    function renderFormFields(isEdit = false) {
        return (
            <>
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder={isEdit ? "New Password (optional)" : "Password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    {...(isEdit ? {} : { required: true })}
                />

                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="company">Company</option>
                    <option value="warehouse_admin">Warehouse Admin</option>
                    <option value="shop">Shop</option>
                </select>

                {formData.role === "warehouse_admin" && (
                    <>
                        <select
                            value={formData.company_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    company_id: e.target.value,
                                    warehouse_id: "",
                                })
                            }
                            className="w-full border px-3 py-2 rounded"
                            required
                        >
                            <option value="">Select Company</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>

                        {formData.company_id && (
                            <select
                                value={formData.warehouse_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        warehouse_id: e.target.value,
                                    })
                                }
                                className="w-full border px-3 py-2 rounded"
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </>
                )}
            </>
        );
    }
}
