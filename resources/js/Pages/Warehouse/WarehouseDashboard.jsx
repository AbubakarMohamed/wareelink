import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthService from "@/Services/AuthService";
import React from 'react';

export default function WarehouseDashboard({ warehouse }) {
  useEffect(() => {
    AuthService.getUser().then((user) => {
      if (user.role !== "warehouse_admin") {
        router.visit(AuthService.getRedirectUrl(user.role));
      }
    });
  }, []);

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Warehouse Admin Dashboard
        </h2>
      }
    >
      <Head title="Warehouse Admin Dashboard" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 text-gray-900">
            🎉 Welcome to your <strong>Warehouse Admin Dashboard</strong>!  
            Here you can manage inventory, shipments, and warehouse operations.
          </div>

          {/* ✅ Warehouse Details */}
          {warehouse && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-semibold">Warehouse: {warehouse.name}</h1>
              <p className="mt-1">Location: {warehouse.location}</p>
              <p>Capacity: {warehouse.capacity}</p>

              <h2 className="mt-4 text-xl font-semibold">Stocks</h2>

              {warehouse.stocks.length > 0 ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border">#</th>
                        <th className="px-4 py-2 border">Product</th>
                        <th className="px-4 py-2 border">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouse.stocks.map((stock, index) => (
                        <tr key={stock.id} className="text-gray-700">
                          <td className="px-4 py-2 border">{index + 1}</td>
                          <td className="px-4 py-2 border">{stock.product_name}</td>
                          <td className="px-4 py-2 border">{stock.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">No stocks available in this warehouse yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
