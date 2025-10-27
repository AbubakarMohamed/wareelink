import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { ListFilter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StockReport({ company, report }) {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [skuFilter, setSkuFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const totalValue = report.reduce((sum, r) => sum + r.value, 0);

  // Unique filter options
  const warehouses = [...new Set(report.map((r) => r.warehouse))];
  const products = [...new Set(report.map((r) => r.product))];
  const skus = [...new Set(report.map((r) => r.sku))];

  // Filtering logic
  const filteredReport = useMemo(() => {
    return report.filter((r) => {
      const matchesSearch =
        r.product.toLowerCase().includes(search.toLowerCase()) ||
        r.sku.toLowerCase().includes(search.toLowerCase()) ||
        (r.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesWarehouse =
        warehouseFilter === "all" ? true : r.warehouse === warehouseFilter;
      const matchesProduct =
        productFilter === "all" ? true : r.product === productFilter;
      const matchesSku = skuFilter === "all" ? true : r.sku === skuFilter;
      return matchesSearch && matchesWarehouse && matchesProduct && matchesSku;
    });
  }, [report, search, warehouseFilter, productFilter, skuFilter]);

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StockReport");
    XLSX.writeFile(workbook, "stock_report.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.text(`Stock Report - ${company.name}`, 14, 10);

    // Prepare table body
    const tableBody = filteredReport.map((row, index) => [
      index + 1,
      row.warehouse,
      row.product,
      row.sku,
      row.category,
      row.quantity,
      `Ksh ${Number(row.unit_price).toLocaleString()}`,
      `Ksh ${Number(row.value).toLocaleString()}`,
    ]);

    // Add grand total row
    const totalValue = filteredReport.reduce((sum, r) => sum + r.value, 0);
    tableBody.push([
      "", "", "", "", "", "", "Grand Total", `Ksh ${Number(totalValue).toLocaleString()}`, ""
    ]);

    // Generate table
    autoTable(doc, {
      head: [
        [
          "#",
          "Warehouse",
          "Product",
          "SKU",
          "Category",
          "Quantity",
          "Unit Price",
          "Total Value",
        ],
      ],
      body: tableBody,
      startY: 20, // start below the title
      styles: { fontSize: 10 },
    });
    doc.save("stock_report.pdf");
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Stock Report - {company.name}
        </h2>
      }
    >
      <Head title="Stock Report" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Inventory Report for {company.name}
            </h3>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
              >
                <ListFilter className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200" />
              </button>
              <button
                onClick={exportExcel}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export Excel
              </button>
              <button
                onClick={exportPDF}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Export PDF
              </button>
            </div>

            {/* Hidden filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border rounded"
                />
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((w, i) => (
                    <option key={i} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="all">All Products</option>
                  {products.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={skuFilter}
                  onChange={(e) => setSkuFilter(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="all">All SKUs</option>
                  {skus.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filteredReport.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">#</th>
                      <th className="px-4 py-2 border">Warehouse</th>
                      <th className="px-4 py-2 border">Product</th>
                      <th className="px-4 py-2 border">SKU</th>
                      <th className="px-4 py-2 border">Category</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Unit Price</th>
                      <th className="px-4 py-2 border">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReport.map((row, index) => (
                      <tr key={index} className="text-gray-700">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">{row.warehouse}</td>
                        <td className="px-4 py-2 border">{row.product}</td>
                        <td className="px-4 py-2 border">{row.sku}</td>
                        <td className="px-4 py-2 border">{row.category}</td>
                        <td className="px-4 py-2 border">{row.quantity}</td>
                        <td className="px-4 py-2 border">
                          Ksh {Number(row.unit_price).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border">
                          Ksh {Number(row.value).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan="7" className="px-4 py-2 border text-right">
                        Grand Total
                      </td>
                      <td className="px-4 py-2 border">
                        Ksh {Number(totalValue).toLocaleString()}
                      </td>
                      
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No stock data available.</p>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
