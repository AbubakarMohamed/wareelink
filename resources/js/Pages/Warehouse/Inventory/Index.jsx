import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function InventoryIndex({ warehouse, warehouses, auth }) {
  // ✅ Combine all stocks for admin by default
  const allStocks = useMemo(() => {
    if (auth?.user?.role === "admin" && warehouses?.length > 0) {
      return warehouses.flatMap((w) =>
        (w.stocks || []).map((stock) => ({
          id: stock.id,
          product_name: stock.product?.name || "Unnamed Product",
          quantity: stock.quantity,
          visible_to_shop: stock.visible_to_shop,
          warehouse_name: w.name,
          company_name: w.company?.name || "N/A",
        }))
      );
    }

    // For warehouse_admin
    return (
      warehouse?.stocks.map((stock) => ({
        id: stock.id,
        product_name: stock.product?.name || "Unnamed Product",
        quantity: stock.quantity,
        visible_to_shop: stock.visible_to_shop,
        warehouse_name: warehouse?.name || "N/A",
        company_name: warehouse?.company?.name || "N/A",
      })) || []
    );
  }, [warehouses, warehouse, auth]);

  const [stocks, setStocks] = useState(allStocks);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const openDialog = (stock) => {
    setSelectedStock(stock);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedStock(null);
    setDialogOpen(false);
  };

  const handleToggle = () => {
    if (!selectedStock) return;

    router.put(
      route("warehouse.inventory.toggleVisibility", selectedStock.id),
      {},
      {
        onSuccess: () => {
          setStocks((prev) =>
            prev.map((s) =>
              s.id === selectedStock.id
                ? { ...s, visible_to_shop: !s.visible_to_shop }
                : s
            )
          );
          closeDialog();
        },
      }
    );
  };

  // ✅ Admin filter by warehouse
  const handleWarehouseChange = (e) => {
    const value = e.target.value;
    setSelectedWarehouse(value);

    if (value === "all") {
      setStocks(allStocks);
    } else {
      const filtered =
        warehouses
          ?.find((w) => w.id === parseInt(value))
          ?.stocks.map((stock) => ({
            id: stock.id,
            product_name: stock.product?.name || "Unnamed Product",
            quantity: stock.quantity,
            visible_to_shop: stock.visible_to_shop,
            warehouse_name: warehouses.find((w) => w.id === parseInt(value))
              ?.name,
            company_name:
              warehouses.find((w) => w.id === parseInt(value))?.company?.name ||
              "N/A",
          })) || [];
      setStocks(filtered);
    }
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Inventory</h2>}
    >
      <Head title="Inventory" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Inventory</h1>

              {/* ✅ Admin warehouse filter */}
              {auth?.user?.role === "admin" && warehouses?.length > 0 && (
                <select
                  value={selectedWarehouse}
                  onChange={handleWarehouseChange}
                  className="border rounded px-3 py-2 text-gray-700"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {stocks.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border text-left">#</th>
                      <th className="px-4 py-2 border text-left">Product</th>
                      <th className="px-4 py-2 border text-left">Quantity</th>
                      {auth?.user?.role === "admin" && (
                        <>
                          <th className="px-4 py-2 border text-left">Company</th>
                          <th className="px-4 py-2 border text-left">
                            Warehouse
                          </th>
                        </>
                      )}
                      <th className="px-4 py-2 border text-left">
                        Visible to Shop
                      </th>
                      {(auth?.user?.role === "warehouse_admin" ||
                        auth?.user?.role === "admin") && (
                        <th className="px-4 py-2 border text-left">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock, index) => (
                      <tr key={stock.id} className="text-gray-700">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">
                          {stock.product_name}
                        </td>
                        <td className="px-4 py-2 border">{stock.quantity}</td>
                        {auth?.user?.role === "admin" && (
                          <>
                            <td className="px-4 py-2 border">
                              {stock.company_name}
                            </td>
                            <td className="px-4 py-2 border">
                              {stock.warehouse_name}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-2 border">
                          {stock.visible_to_shop ? "Yes" : "No"}
                        </td>
                        {(auth?.user?.role === "warehouse_admin" ||
                          auth?.user?.role === "admin") && (
                          <td className="px-4 py-2 border">
                            <button
                              onClick={() => openDialog(stock)}
                              className={`px-3 py-1 rounded ${
                                stock.visible_to_shop
                                  ? "bg-red-500 text-white"
                                  : "bg-green-500 text-white"
                              }`}
                            >
                              {stock.visible_to_shop ? "Hide" : "Make Visible"}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-gray-500">
                No stocks available in this warehouse yet.
              </p>
            )}

            {/* ✅ Dialog Modal */}
            {dialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                  <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
                  <p className="mb-6">
                    Are you sure you want to{" "}
                    {selectedStock.visible_to_shop ? "hide" : "make visible"}{" "}
                    <strong>{selectedStock.product_name}</strong>?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={closeDialog}
                      className="px-4 py-2 rounded bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleToggle}
                      className={`px-4 py-2 rounded ${
                        selectedStock.visible_to_shop
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
