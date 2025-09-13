import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

import { useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthService from "@/Services/AuthService";

export default function CompanyDashboard() {
  useEffect(() => {
    AuthService.getUser().then((user) => {
      if (user.role !== "company") {
        router.visit(AuthService.getRedirectUrl(user.role));
      }
    });
  }, []);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Company Dashboard
                </h2>
            }
        >
            <Head title="Company Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            🎉 Welcome to your <strong>Company Dashboard</strong>!  
                            Here you can manage your warehouses, employees, and company settings.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
