import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthService from "@/Services/AuthService";
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon, // ✅ Added Cancelled icon
} from "@heroicons/react/24/outline";

export default function ShopDashboard({ stats, recentRequests }) {
  useEffect(() => {
    AuthService.getUser().then((user) => {
      if (user.role !== "shop") {
        router.visit(AuthService.getRedirectUrl(user.role));
      }
    });
  }, []);

  const cards = [
    {
      name: "Total Requests",
      value: stats?.totalRequests ?? 0,
      icon: ClipboardDocumentCheckIcon,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      name: "Approved",
      value: stats?.approved ?? 0,
      icon: CheckCircleIcon,
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Pending",
      value: stats?.pending ?? 0,
      icon: ClockIcon,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      name: "Cancelled",
      value: stats?.cancelled ?? 0, // ✅ New stat
      icon: XCircleIcon,
      color: "bg-gray-100 text-gray-600",
    },
    {
      name: "Unpaid Invoices",
      value: stats?.unpaidInvoices ?? 0,
      icon: CurrencyDollarIcon,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-2xl font-bold leading-tight text-gray-800">
          Shop Dashboard
        </h2>
      }
    >
      <Head title="Shop Dashboard" />

      <div className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
              <div
                key={card.name}
                className="rounded-xl bg-white p-6 shadow hover:shadow-md transition"
              >
                <div
                  className={`inline-flex items-center justify-center rounded-lg p-3 ${card.color}`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm text-gray-500">{card.name}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Requests */}
          <div className="mt-10 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Requests
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests?.length > 0 ? (
                    recentRequests.map((req) => (
                      <tr key={req.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{req.stock?.product?.name}</td>
                        <td className="px-4 py-2">{req.quantity}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              req.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : req.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : req.status === "cancelled"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                        No recent requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
