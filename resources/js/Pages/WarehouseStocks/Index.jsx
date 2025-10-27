import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; 
import { Head, router, usePage, useForm } from "@inertiajs/react";
import { Menu, Transition, Dialog, Combobox } from "@headlessui/react";
import { Fragment, useState, useMemo, useRef } from "react";
import { ListFilter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Index({ stocks, companies, warehouses, products, auth }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "add", "edit", "delete"
    const [editingStock, setEditingStock] = useState(null);

    const [stocksForm, setStocksForm] = useState([{ company_id: "", warehouse_id: "", product_id: "", quantity: "" }]);
// 🧠 Dynamic filtering based on selected company
const getCompanyWarehouses = (companyId) =>
    warehouses.filter((w) => w.company_id === companyId);

const getCompanyProducts = (companyId) =>
    products.filter((p) => p.company_id === companyId);

    const form = useForm({
        company_id: "",
        warehouse_id: "",
        product_id: "",
        quantity: "",
    });

    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showFilters, setShowFilters] = useState(false);
    const reference = useRef(null);
    const itemsPerPage = 5;

    const [warehouseQuery, setWarehouseQuery] = useState("");
    const [productQuery, setProductQuery] = useState("");

    const filteredWarehouses = warehouseQuery === ""
        ? warehouses
        : warehouses.filter((w) => w.name.toLowerCase().includes(warehouseQuery.toLowerCase()));

    const filteredProducts = productQuery === ""
        ? products
        : products.filter((p) => p.name.toLowerCase().includes(productQuery.toLowerCase()));

    const { errors } = usePage().props;

    const openModal = (type, stock = null) => {
        setModalType(type);
        if (type === "edit" && stock) {
            setEditingStock(stock);
            form.setData({
                company_id: stock.company_id,
                warehouse_id: stock.warehouse_id,
                product_id: stock.product_id,
                quantity: stock.quantity,
            });
        } else if (type === "add") {
            setEditingStock(null);
            setStocksForm([{ company_id: "", warehouse_id: "", product_id: "", quantity: "" }]);
        } else if (type === "delete") {
            setEditingStock(stock);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType("");
        setEditingStock(null);
        form.reset();
    };
    const [companyQuery, setCompanyQuery] = useState("");
    const filteredCompanies =
        companyQuery === ""
            ? companies
            : companies.filter((c) =>
                  c.name.toLowerCase().includes(companyQuery.toLowerCase())
              );
    
    const handleStockChange = (index, name, value) => {
        const newStocks = [...stocksForm];
        newStocks[index][name] = value;
        setStocksForm(newStocks);
    };

    const addStockRow = () => {
        setStocksForm([...stocksForm, { company_id: "", warehouse_id: "", product_id: "", quantity: "" }]);
    };

    const removeStockRow = (index) => {
        setStocksForm(stocksForm.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalType === "edit") {
            form.put(route("warehousestocks.update", editingStock.id), {
                onSuccess: closeModal,
            });
        } else if (modalType === "add") {
            const payload = {
                stocks: stocksForm.map(s => ({
                    company_id: auth.user.role === "admin" ? s.company_id : auth.user.company_id, // ✅ admin selects company; otherwise, use user's
                    warehouse_id: s.warehouse_id,
                    product_id: s.product_id,
                    quantity: Number(s.quantity),
                })),
            };

            router.post(route("warehousestocks.storeMultiple"), payload, {
                onSuccess: () => {
                    closeModal();
                    setStocksForm([{ company_id: "", warehouse_id: "", product_id: "", quantity: "" }]);
                },
                onError: () => { }, // errors are automatically populated in usePage().props.errors
            });
        } else if (modalType === "delete") {
            router.delete(route("warehousestocks.destroy", editingStock.id), {
                onSuccess: closeModal,
            });
        }
    };

    const handleDelete = (stock) => openModal("delete", stock);

    const filteredStocks = useMemo(() => {
        return stocks.filter((s) => {
            const matchesSearch =
                s.warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
                s.product.name.toLowerCase().includes(search.toLowerCase());
            const matchesWarehouse = warehouseFilter === "all" ? true : s.warehouse_id === warehouseFilter;
            const matchesProduct = productFilter === "all" ? true : s.product_id === productFilter;
            return matchesSearch && matchesWarehouse && matchesProduct;
        });
    }, [stocks, search, warehouseFilter, productFilter]);

    const sortedStocks = useMemo(() => {
        let sortable = [...filteredStocks];
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
    }, [filteredStocks, sortConfig]);

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

    const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
    const paginatedStocks = sortedStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sortedStocks.map((s) => ({
            Warehouse: s.warehouse.name,
            Product: s.product.name,
            Quantity: s.quantity,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");
        XLSX.writeFile(workbook, "stocks.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Warehouse Stocks Report", 14, 10);
        const head = auth.user.role === "admin"
            ? [["#", "Warehouse", "Product", "Quantity", "Company"]]
            : [["#", "Warehouse", "Product", "Quantity"]];

        const body = sortedStocks.map((s, i) =>
            auth.user.role === "admin"
                ? [i + 1, s.warehouse.name, s.product.name, s.quantity, s.company?.name || "—"]
                : [i + 1, s.warehouse.name, s.product.name, s.quantity]
        );
        autoTable(doc, { startY: 20, head, body });
        doc.save("stocks.pdf");
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Warehouse Stocks</h2>}>
            <Head title="Warehouse Stocks" />
            <div className="p-6 bg-white rounded shadow">
                <div className="flex justify-between mb-4 items-center">
                    <h3 className="text-lg font-medium text-gray-700">All Stocks</h3>
                    <div className="flex items-center gap-2">
                        <button ref={reference} onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <ListFilter />
                        </button>
                        <button onClick={exportExcel} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export Excel</button>
                        <button onClick={exportPDF} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Export PDF</button>
                        <button onClick={() => openModal("add")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Stock</button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:gap-4">
                        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto" />
                        <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto">
                            <option value="all">All Warehouses</option>
                            {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                        </select>
                        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="px-3 py-2 border rounded w-full md:w-auto">
                            <option value="all">All Products</option>
                            {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                    </div>
                )}

                <table className="w-full border text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("id")}># {getSortArrow("id")}</th>
                            {/* ✅ Show company column only for admin */}
                            {auth.user.role === "admin" && (
                                <th className="p-2 border cursor-pointer" onClick={() => requestSort("company_id")}>Company {getSortArrow("company_id")}</th>
                            )}
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("warehouse_id")}>Warehouse {getSortArrow("warehouse_id")}</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("product_id")}>Product {getSortArrow("product_id")}</th>
                            <th className="p-2 border cursor-pointer" onClick={() => requestSort("quantity")}>Quantity {getSortArrow("quantity")}</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedStocks.length > 0 ? (
                            paginatedStocks.map((s, index) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    {/* ✅ Admin-only company column */}
                                    {auth.user.role === "admin" && (
                                        <td className="p-2 border text-center">{s.company?.name || "—"}</td>
                                    )}
                                    <td className="p-2 border">{s.warehouse.name}</td>
                                    <td className="p-2 border">{s.product.name}</td>
                                    <td className="p-2 border text-center">{s.quantity}</td>
                                    <td className="p-2 border text-center">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="px-2 py-1 rounded hover:bg-gray-100">...</Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white border rounded shadow-lg z-10">
                                                    <Menu.Item>{({ active }) => <button onClick={() => openModal("edit", s)} className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm`}>Edit</button>}</Menu.Item>
                                                    <Menu.Item>{({ active }) => <button onClick={() => handleDelete(s)} className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-red-600`}>Delete</button>}</Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">No stocks found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">Page {currentPage} of {totalPages || 1}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

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
                                        <Dialog.Title className="text-lg font-medium text-gray-900">Delete Stock</Dialog.Title>
                                        <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this stock? This action cannot be undone.</p>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                                            <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">{modalType === "edit" ? "Edit Stock" : "Add Stocks"}</Dialog.Title>
                                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            {modalType === "add" ? (
                                                stocksForm.map((stock, index) => (
                                                    <div key={index} className="p-4 border rounded space-y-2 relative">
                                                        {stocksForm.length > 1 && (
                                                            <button type="button" onClick={() => removeStockRow(index)} className="absolute top-2 right-2 text-red-600 font-bold">×</button>
                                                        )}
                                                        {auth.user.role === "admin" && (
    <Combobox
        value={stock.company_id}
        onChange={(val) => handleStockChange(index, "company_id", val)}
    >
        <div className="relative">
            <Combobox.Input
                className="px-3 py-2 border rounded w-full"
                displayValue={(id) =>
                    companies.find((c) => c.id === id)?.name || ""
                }
                onChange={(e) => setCompanyQuery(e.target.value)}
                placeholder="Select company"
            />
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border">
                {filteredCompanies.map((c) => (
                    <Combobox.Option
                        key={c.id}
                        value={c.id}
                        className={({ active }) =>
                            `cursor-pointer select-none px-3 py-2 ${
                                active ? "bg-blue-500 text-white" : ""
                            }`
                        }
                    >
                        {c.name}
                    </Combobox.Option>
                ))}
            </Combobox.Options>
        </div>
        {errors[`stocks.${index}.company_id`] && (
            <p className="text-red-600 text-sm mt-1">
                {errors[`stocks.${index}.company_id`]}
            </p>
        )}
    </Combobox>
)}

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <Combobox
    value={stock.warehouse_id}
    onChange={(val) => handleStockChange(index, "warehouse_id", val)}
>
    <div className="relative">
        <Combobox.Input
            className="px-3 py-2 border rounded w-full"
            displayValue={(id) =>
                warehouses.find((w) => w.id === id)?.name || ""
            }
            onChange={(e) => setWarehouseQuery(e.target.value)}
            placeholder="Select warehouse"
        />
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border">
            {getCompanyWarehouses(stock.company_id)
                .filter((w) =>
                    w.name.toLowerCase().includes(warehouseQuery.toLowerCase())
                )
                .map((w) => (
                    <Combobox.Option
                        key={w.id}
                        value={w.id}
                        className={({ active }) =>
                            `cursor-pointer select-none px-3 py-2 ${
                                active ? "bg-blue-500 text-white" : ""
                            }`
                        }
                    >
                        {w.name}
                    </Combobox.Option>
                ))}
        </Combobox.Options>
    </div>
    {errors[`stocks.${index}.warehouse_id`] && (
        <p className="text-red-600 text-sm mt-1">
            {errors[`stocks.${index}.warehouse_id`]}
        </p>
    )}
</Combobox>


                                                            <Combobox value={stock.product_id} onChange={(val) => handleStockChange(index, "product_id", val)}>
                                                                <div className="relative">
                                                                    <Combobox.Input
                                                                        className="px-3 py-2 border rounded w-full"
                                                                        displayValue={(id) => products.find(p => p.id === id)?.name || ""}
                                                                        onChange={(e) => setProductQuery(e.target.value)}
                                                                        placeholder="Select product"
                                                                    />
                                                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border">
                                                                    {getCompanyProducts(stock.company_id)
    .filter((p) =>
        p.name.toLowerCase().includes(productQuery.toLowerCase())
    )
    .map((p) => (
        <Combobox.Option
            key={p.id}
            value={p.id}
            className={({ active }) =>
                `cursor-pointer select-none px-3 py-2 ${
                    active ? "bg-blue-500 text-white" : ""
                }`
            }
        >
            {p.name}
        </Combobox.Option>
    ))}

                                                                    </Combobox.Options>
                                                                </div>
                                                                {errors[`stocks.${index}.product_id`] && <p className="text-red-600 text-sm mt-1">{errors[`stocks.${index}.product_id`]}</p>}
                                                            </Combobox>

                                                            <div>
                                                                <input type="number" placeholder="Quantity" value={stock.quantity} onChange={(e) => handleStockChange(index, "quantity", e.target.value)} className="px-3 py-2 border rounded w-full" />
                                                                {errors[`stocks.${index}.quantity`] && <p className="text-red-600 text-sm mt-1">{errors[`stocks.${index}.quantity`]}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <select value={form.data.warehouse_id} onChange={(e) => form.setData("warehouse_id", e.target.value)} className="px-3 py-2 border rounded">
                                                        <option value="">Select warehouse</option>
                                                        {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                                                    </select>
                                                    {errors.warehouse_id && <p className="text-red-600 text-sm mt-1">{errors.warehouse_id}</p>}

                                                    <select value={form.data.product_id} onChange={(e) => form.setData("product_id", e.target.value)} className="px-3 py-2 border rounded">
                                                        <option value="">Select product</option>
                                                        {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                                    </select>
                                                    {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}

                                                    <input type="number" placeholder="Quantity" value={form.data.quantity} onChange={(e) => form.setData("quantity", e.target.value)} className="px-3 py-2 border rounded" />
                                                    {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
                                                </div>
                                            )}
                                            {modalType === "add" && (
                                                <button type="button" onClick={addStockRow} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">+ Add Another</button>
                                            )}
                                            <div className="mt-4 flex justify-end">
                                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{modalType === "edit" ? "Update" : "Submit"}</button>
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
