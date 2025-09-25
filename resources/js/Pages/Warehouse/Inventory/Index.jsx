import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

export default function InventoryIndex({ warehouse, auth }) {
  const [stocks, setStocks] = useState(
    warehouse?.stocks.map((stock) => ({
      id: stock.id,
      product_name: stock.product?.name || "Unnamed Product",
      quantity: stock.quantity,
      visible_to_shop: stock.visible_to_shop,
    })) || []
  );

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

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Inventory</h2>}
    >
      <Head title="Inventory" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold">
              Inventory: {warehouse?.name}
            </h1>

            {stocks.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">#</th>
                      <th className="px-4 py-2 border">Product</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Visible to Shop</th>
                      {auth?.user?.role === "warehouse_admin" && (
                        <th className="px-4 py-2 border">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock, index) => (
                      <tr key={stock.id} className="text-gray-700">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">{stock.product_name}</td>
                        <td className="px-4 py-2 border">{stock.quantity}</td>
                        <td className="px-4 py-2 border">
                          {stock.visible_to_shop ? "Yes" : "No"}
                        </td>
                        {auth?.user?.role === "warehouse_admin" && (
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

            {/* Dialogue Modal */}
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
