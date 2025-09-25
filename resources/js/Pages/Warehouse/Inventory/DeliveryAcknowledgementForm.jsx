import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function DeliveryAcknowledgementForm({ delivery, auth }) {
  const [acknowledgement, setAcknowledgement] = useState("full");
  const [goodQuantity, setGoodQuantity] = useState(delivery.quantity || 0);
  const [badQuantity, setBadQuantity] = useState(0);
  const [missingQuantity, setMissingQuantity] = useState(0);
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(`/deliveries/${delivery.id}/acknowledge`, {
      acknowledgement,
      good_quantity: goodQuantity,
      bad_quantity: badQuantity,
      missing_quantity: missingQuantity,
      remarks,
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Acknowledge Delivery" />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Acknowledge Delivery</h1>

        <div className="mb-4">
          <strong>Product:</strong> {delivery.product.name}
        </div>
        <div className="mb-4">
          <strong>Quantity:</strong> {delivery.quantity}
        </div>
        <div className="mb-4">
          <strong>Warehouse:</strong> {delivery.warehouse.name}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Acknowledgement */}
          <div>
            <label className="block font-medium mb-1">Acknowledgement</label>
            <select
              value={acknowledgement}
              onChange={(e) => setAcknowledgement(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="full">Full</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing</option>
            </select>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">Good Quantity</label>
              <input
                type="number"
                min="0"
                value={goodQuantity}
                onChange={(e) => setGoodQuantity(parseInt(e.target.value) || 0)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Bad Quantity</label>
              <input
                type="number"
                min="0"
                value={badQuantity}
                onChange={(e) => setBadQuantity(parseInt(e.target.value) || 0)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Missing Quantity</label>
              <input
                type="number"
                min="0"
                value={missingQuantity}
                onChange={(e) => setMissingQuantity(parseInt(e.target.value) || 0)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-medium mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              rows="3"
              placeholder="Specify any issues or notes"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit Acknowledgement
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
