import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function ShopDashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Shop Dashboard
                </h2>
            }
        >
            <Head title="Shop Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            🎉 Welcome to your <strong>Shop Dashboard</strong>!  
                            Here you can manage your products, orders, and inventory.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
