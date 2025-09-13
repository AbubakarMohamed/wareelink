import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

import { useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthService from "@/Services/AuthService";

export default function WarehouseDashboard() {
  useEffect(() => {
    AuthService.getUser().then((user) => {
      if (user.role !== "warehouse") {
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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            🎉 Welcome to your <strong>Warehouse Admin Dashboard</strong>!  
                            Here you can manage inventory, shipments, and warehouse operations.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
