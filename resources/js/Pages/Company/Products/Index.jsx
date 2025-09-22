import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { Fragment, useState, useMemo, useRef } from "react";
import { ListFilter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Index() {
    const { products } = usePage().props;

    // Modal & Form States
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "add", "edit", "delete"
    const [editingProduct, setEditingProduct] = useState(null);

    // Multi-product form state
    const [productsForm, setProductsForm] = useState([
        { name: "", sku: "", category: "", description: "", price: "", stock: 0, status: "active" },
    ]);

    // Single-product form for editing
    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        status: "active",
    });

    // 🔎 Search, Filter, Pagination, Sorting states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showFilters, setShowFilters] = useState(false);
    const reference = useRef(null);
    const itemsPerPage = 5;

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

    // Open modal
    const openModal = (type, product = null) => {
        setModalType(type);
        if (type === "edit" && product) {
            setEditingProduct(product);
            setForm({
                name: product.name || "",
                sku: product.sku || "",
                category: product.category || "",
                description: product.description || "",
                price: product.price || "",
                stock: product.stock || 0,
                status: product.status || "active",
            });
        } else if (type === "add") {
            setEditingProduct(null);
            setProductsForm([{ name: "", sku: "", category: "", description: "", price: "", stock: 0, status: "active" }]);
        } else if (type === "delete") {
            setEditingProduct(product);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType("");
        setEditingProduct(null);
    };

    // Single product change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Multi-product change
    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        const newProducts = [...productsForm];
        newProducts[index][name] = value;
        setProductsForm(newProducts);
    };

    const addProductRow = () => {
        setProductsForm([...productsForm, { name: "", sku: "", category: "", description: "", price: "", stock: 0, status: "active" }]);
    };

    const removeProductRow = (index) => {
        const newProducts = productsForm.filter((_, i) => i !== index);
        setProductsForm(newProducts);
    };

    // 📥 Import Excel
    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            // Map Excel columns to product form structure
            const importedProducts = jsonData.map((row) => ({
                name: row["Name"] || "",
                sku: row["SKU"] || "",
                category: row["Category"] || "",
                description: row["Description"] || "",
                price: row["Price"] || "",
                stock: row["Stock"] || 0,
                status: row["Status"]?.toLowerCase() === "inactive" ? "inactive" : "active",
            }));

            setProductsForm(importedProducts);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalType === "edit") {
            router.put(route("company.products.update", editingProduct.id), form, {
                onSuccess: closeModal,
            });
        } else if (modalType === "add") {
            router.post(route("company.products.storeMultiple"), { products: productsForm }, {
                onSuccess: closeModal,
            });
        } else if (modalType === "delete") {
            router.delete(route("company.products.destroy", editingProduct.id), {
                onSuccess: closeModal,
            });
        }
    };

    // 🔎 Filtering + Searching
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase()) ||
                (p.category ?? "").toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
            const matchesCategory = categoryFilter === "all" ? true : p.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [products, search, statusFilter, categoryFilter]);

    // 🔀 Sorting
    const sortedProducts = useMemo(() => {
        let sortable = [...filteredProducts];
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
    }, [filteredProducts, sortConfig]);

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
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Export Excel
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sortedProducts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, "products.xlsx");
    };

    // Export PDF
    const exportPDF = () => {
        if (typeof window === "undefined") return;

        const doc = new jsPDF();
        const now = new Date().toLocaleString();
        doc.text("Products Report", 14, 10);
        doc.setFontSize(10);
        doc.text(`Generated at: ${now}`, 14, 16);
        if (search) doc.text(`Search keyword: "${search}"`, 14, 22);
        if (statusFilter !== "all") doc.text(`Status filter: ${statusFilter}`, 14, 28);
        if (categoryFilter !== "all") doc.text(`Category filter: ${categoryFilter}`, 14, 34);

        autoTable(doc, {
            startY: 40,
            head: [["#", "Name", "SKU", "Category", "Description", "Price", "Stock", "Status"]],
            body: sortedProducts.map((p, index) => [
                index + 1,
                p.name,
                p.sku,
                p.category ?? "-",
                p.description ?? "-",
                `$${Number(p.price).toFixed(2)}`,
                p.stock ?? 0,
                p.status,
            ]),
        });

        doc.save("products.pdf");
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}>
            <Head title="Products" />

            <div className="p-6 bg-white rounded shadow">
                {/* Header & Actions */}
                <div className="flex justify-between mb-4 items-center">
                    <h3 className="text-lg font-medium text-gray-700">All Products</h3>
                    <div className="flex items-center gap-2">
                        <button ref={reference} onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200">
                            <ListFilter />
                        </button>
                        <button onClick={exportExcel} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export Excel</button>
                        <button onClick={exportPDF} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Export PDF</button>
                        <button onClick={() => openModal("add")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Product</button>
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
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto">
                            <option value="all">All Categories</option>
                            {categories.map((cat, i) => (
                                <option key={i} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Products Table */}
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("id")}># {getSortArrow("id")}</th>
                            <th className="p-2 border cursor-pointer text-left" onClick={() => requestSort("name")}>Name {getSortArrow("name")}</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("sku")}>SKU {getSortArrow("sku")}</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("category")}>Category {getSortArrow("category")}</th>
                            <th className="p-2 border text-left">Description</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("price")}>Price {getSortArrow("price")}</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("stock")}>Stock {getSortArrow("stock")}</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("status")}>Status {getSortArrow("status")}</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="p-2 border">{product.name}</td>
                                    <td className="p-2 border text-center">{product.sku}</td>
                                    <td className="p-2 border text-center">{product.category ?? "-"}</td>
                                    <td className="p-2 border">{product.description ?? "-"}</td>
                                    <td className="p-2 border text-center">${Number(product.price).toFixed(2)}</td>
                                    <td className="p-2 border text-center">{product.stock ?? 0}</td>
                                    <td className="p-2 border text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${product.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {product.status}
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
                                                    <Menu.Item>{({ active }) => (
                                                        <button onClick={() => openModal("edit", product)} className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm`}>Edit</button>
                                                    )}</Menu.Item>
                                                    <Menu.Item>{({ active }) => (
                                                        <button onClick={() => openModal("delete", product)} className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-red-600`}>Delete</button>
                                                    )}</Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="p-4 text-center text-gray-500">No products found.</td>
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
                                        <Dialog.Title className="text-lg font-medium text-gray-900">Delete Product</Dialog.Title>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Are you sure you want to delete <strong>{editingProduct?.name}</strong>? This action cannot be undone.
                                        </p>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                            <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">
                                            {modalType === "edit" ? "Edit Product" : "Add Products"}
                                        </Dialog.Title>

                                        {/* Import Excel Button */}
                                        {modalType === "add" && (
                                            <div className="mt-2 mb-4">
                                                <label className="px-3 py-2 bg-yellow-500 text-white rounded cursor-pointer hover:bg-yellow-600">
                                                    Import Excel
                                                    <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
                                                </label>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            {modalType === "add" ? (
                                                productsForm.map((prod, index) => (
                                                    <div key={index} className="p-4 border rounded space-y-2 relative">
                                                        {productsForm.length > 1 && (
                                                            <button type="button" onClick={() => removeProductRow(index)} className="absolute top-2 right-2 text-red-600 font-bold">×</button>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <input type="text" name="name" placeholder="Name" value={prod.name} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full" required />
                                                            <input type="text" name="sku" placeholder="SKU" value={prod.sku} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full" required />
                                                            <input type="text" name="category" placeholder="Category" value={prod.category} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full" />
                                                            <input type="number" name="price" placeholder="Price" value={prod.price} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full" min="0" step="0.01" required />
                                                            <input type="number" name="stock" placeholder="Stock" value={prod.stock} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full" min="0" />
                                                            <select name="status" value={prod.status} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full">
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </select>
                                                            <textarea name="description" placeholder="Description" value={prod.description} onChange={(e) => handleProductChange(index, e)} className="px-3 py-2 border rounded w-full md:col-span-2"></textarea>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="px-3 py-2 border rounded w-full" required />
                                                    <input type="text" name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} className="px-3 py-2 border rounded w-full" required />
                                                    <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} className="px-3 py-2 border rounded w-full" />
                                                    <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} className="px-3 py-2 border rounded w-full" min="0" step="0.01" required />
                                                    <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} className="px-3 py-2 border rounded w-full" min="0" />
                                                    <select name="status" value={form.status} onChange={handleChange} className="px-3 py-2 border rounded w-full">
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                    <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="px-3 py-2 border rounded w-full md:col-span-2"></textarea>
                                                </div>
                                            )}
                                            {modalType === "add" && (
                                                <button type="button" onClick={addProductRow} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add Another Product</button>
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
