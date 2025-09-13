import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

import { useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthService from "@/Services/AuthService";

export default function AdminDashboard() {
  useEffect(() => {
    AuthService.getUser().then((user) => {
      if (user.role !== "admin") {
        router.visit(AuthService.getRedirectUrl(user.role));
      }
    });
  }, []);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            🎉 Welcome to your <strong>Admin Dashboard</strong>!  
                            Here you can manage users, roles, and system settings.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
