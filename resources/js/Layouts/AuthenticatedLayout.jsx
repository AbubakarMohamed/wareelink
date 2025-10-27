import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

// ✅ Heroicons
import {
    HomeIcon,
    BuildingStorefrontIcon,
    BuildingOfficeIcon,
    CubeIcon,
    UserGroupIcon,
    Cog6ToothIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    TruckIcon,
    ArchiveBoxIcon,
    Bars3Icon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth?.user;
    const [showSidebar, setShowSidebar] = useState(true);
    const [openSections, setOpenSections] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleSection = (heading) => {
        setOpenSections((prev) => ({
            ...prev,
            [heading]: !prev[heading],
        }));
    };

    const menuItems = {
        admin: [
            {
                heading: "General",
                items: [
                    {
                        label: "Dashboard",
                        route: "admin.dashboard",
                        icon: HomeIcon,
                        description: "Overview & insights",
                    },
                ],
            },
            {
                heading: "👥 Management",
                items: [
                    {
                        label: "Users",
                        route: "admin.users.index",
                        icon: UserGroupIcon,
                        badge: "12 new",
                        description: "Manage platform users",
                    },
                ],
            },
            {
                heading: "Company",
                items: [
                    {
                        label: "Warehouses",
                        route: "admin.warehouses.index",
                        icon: BuildingOfficeIcon,
                        description: "Track warehouse capacity",
                    },
                    {
                        label: "Products",
                        route: "admin.products.index",
                        icon: ArchiveBoxIcon,
                        description: "Manage product catalog",
                    },
                    {
                        label: "Stock",
                        route: "warehousestocks.index",
                        icon: CubeIcon,
                        description: "Manage product catalog",
                    },
                ],
            },
            {
                heading: "Warehouse",
                items: [
                    {
                        label: "Inventory",
                        route: "admin.inventory.index",
                        icon: CubeIcon,
                        description: "Track warehouse capacity",
                    },
                    {
                        label: "Invoices",
                        route: "admin.invoices.index",
                        icon: DocumentTextIcon,
                        description: "Manage product catalog",
                    },
                    {
                        label: "Shop Request",
                        route: "admin.requests.index",
                        icon: ClipboardDocumentListIcon,
                        description: "Manage product catalog",
                    },
                    {
                        label: "Report",
                        route: "admin.warehouse.report",
                        icon: DocumentTextIcon,
                        description: "Manage product catalog",
                    },
                ],
            },
            {
                heading: "Shop",
                items: [
                    {
                        label: "Products",
                        route: "admin.innventory.index",
                        icon: ArchiveBoxIcon,
                        description: "Track warehouse capacity",
                    },
                    {
                        label: "Invoices",
                        route: "admin.innvoices.index",
                        icon: DocumentTextIcon,
                        description: "Manage product catalog",
                    },
                    {
                        label: "Requests",
                        route: "admin.requestss.index",
                        icon: ClipboardDocumentListIcon,
                        description: "Manage product catalog",
                    },
                    {
                        label: "Report",
                        route: "admin.purchase-history",
                        icon: DocumentTextIcon,
                        description: "Manage product catalog",
                    },
                ],
            },
        ],
        company: [
            {
                heading: "General",
                items: [
                    { label: "Dashboard", route: "company.dashboard", icon: HomeIcon },
                ],
            },
            {
                heading: "Products",
                items: [
                    { label: "Manage Products", route: "company.products.index", icon: CubeIcon },
                ],
            },
            {
                heading: "Warehouses",
                items: [
                    { label: "Manage Warehouses", route: "company.warehouses.index", icon: BuildingOfficeIcon },
                ],
            },
            {
                heading: "Stocks",
                items: [
                    { label: "Manage Stocks", route: "warehousestocks.index", icon: CubeIcon },
                ],
            },
            {
                heading: "Admins",
                items: [
                    { label: "Warehouse Admins", route: "company.warehouse-admins.index", icon: UserGroupIcon },
                ],
            },
            {
                heading: "Reports",
                items: [
                    { label: "Stock Reports", route: "company.stock-report.index", icon: Cog6ToothIcon },
                ],
            },
        ],
        warehouse_admin: [
            {
                heading: "General",
                items: [{ label: "Dashboard", route: "warehouse.dashboard", icon: HomeIcon }],
            },
            {
                heading: "Inventory",
                items: [{ label: "Stock Management", route: "warehouse.inventory.index", icon: CubeIcon }],
            },
            {
                heading: "Requests",
                items: [{ label: "Shop Requests", route: "warehouse.requests.index", icon: ClipboardDocumentListIcon }],
            },
            {
                heading: "Finance",
                items: [{ label: "Invoices", route: "warehouse.invoices.index", icon: DocumentTextIcon }],
            },
            {
                heading: "Reports",
                items: [{ label: "Reports", route: "warehouse.warehouse.report", icon: Cog6ToothIcon }],
            },
        ],
        shop: [
            {
                heading: "General",
                items: [{ label: "Dashboard", route: "shop.dashboard", icon: HomeIcon }],
            },
            {
                heading: "Products",
                items: [{ label: "Request Products", route: "shop.innventory.index", icon: CubeIcon }],
            },
            {
                heading: "Requests",
                items: [{ label: "My Requests", route: "shop.requestss.index", icon: ClipboardDocumentListIcon }],
            },
            {
                heading: "Finance",
                items: [{ label: "Invoices", route: "shop.innvoices.index", icon: DocumentTextIcon }],
            },
            {
                heading: "Reports",
                items: [{ label: "Reports", route: "shop.purchase-history", icon: Cog6ToothIcon }],
            },
        ],
    };

    const currentMenu = menuItems[user?.role] || [];

    return (
        <div className="h-screen bg-gray-100 flex flex-col sm:flex-row">
            {/* Sidebar (desktop + mobile) */}
            <aside
                className={`fixed sm:relative z-30 h-full bg-white border-r transition-all duration-200 transform ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 ${showSidebar ? "w-64" : "w-16"}`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <Link href={route("dashboard")}>
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                    <button
                        className="text-gray-500 hover:text-gray-700 sm:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <button
                        className="hidden sm:block text-gray-500 hover:text-gray-700"
                        onClick={() => setShowSidebar((prev) => !prev)}
                    >
                        {showSidebar ? "«" : "»"}
                    </button>
                </div>

                <nav className="mt-6 space-y-2 overflow-y-auto">
                    {currentMenu.map((section) => {
                        const isOpen = openSections[section.heading] ?? true;
                        return (
                            <div key={section.heading}>
                                <button
                                    onClick={() => toggleSection(section.heading)}
                                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    {showSidebar && <span>{section.heading}</span>}
                                    {showSidebar && (
                                        isOpen ? (
                                            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                                        )
                                    )}
                                </button>

                                {isOpen && (
                                    <div className="space-y-1">
                                        {section.items.map((item) => (
                                            <NavLink
                                                key={item.route}
                                                href={route().has(item.route) ? route(item.route) : "#"}
                                                active={route().current(item.route)}
                                                className="flex items-center px-4 py-2 space-x-2"
                                            >
                                                <item.icon className="h-5 w-5 text-gray-500" />
                                                {showSidebar && <span>{item.label}</span>}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-h-0">
                {/* Top Bar */}
                <nav className="border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <button
                            className="sm:hidden text-gray-600 hover:text-gray-800"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        {header && (
                            <h2 className="text-lg font-semibold text-gray-800 truncate max-w-[70vw] sm:max-w-none">
                                {header}
                            </h2>
                        )}
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {user?.name}
                                    <svg
                                        className="ml-2 -mr-0.5 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route("profile.edit")}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route("logout")} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </nav>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
