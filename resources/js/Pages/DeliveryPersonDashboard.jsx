import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function DeliveryPersonDashboard({ deliveries: initialDeliveries }) {
  const { auth } = usePage().props;
  const [deliveries, setDeliveries] = useState(initialDeliveries || []);

  // Handle Pickup action
  const handlePickup = (deliveryId) => {
    router.post(`/deliveries/${deliveryId}/pickup`, {}, {
      onSuccess: (page) => setDeliveries(page.props.deliveries),
    });
  };

  // Handle Finish action
  const handleFinish = (deliveryId) => {
    router.post(`/deliveries/${deliveryId}/finish`, {}, {
      onSuccess: (page) => setDeliveries(page.props.deliveries),
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Deliveries" />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Deliveries</h1>

        {deliveries.length === 0 ? (
          <p>No deliveries assigned.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Warehouse</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery, index) => (
                <tr key={delivery.id} className="text-center">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{delivery.product.name}</td>
                  <td className="p-2 border">{delivery.quantity}</td>
                  <td className="p-2 border">{delivery.warehouse.name}</td>
                  <td className="p-2 border font-semibold">{delivery.status}</td>
                  <td className="p-2 border space-x-2">
                    {delivery.status === "pending" && (
                      <button
                        onClick={() => handlePickup(delivery.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Pickup
                      </button>
                    )}

                    {delivery.status === "in_transit" && (
                      <>
                        {delivery.acknowledgement ? (
                          <button
                            onClick={() => handleFinish(delivery.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded"
                          >
                            Finish
                          </button>
                        ) : (
                          <span className="text-gray-500">Waiting for warehouse ACK...</span>
                        )}
                      </>
                    )}

                    {delivery.status === "acknowledged" && (
                      <button
                        onClick={() => handleFinish(delivery.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        Finish
                      </button>
                    )}

                    {delivery.status === "completed" && (
                      <span className="text-green-600 font-bold">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
