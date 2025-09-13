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
    ChevronDownIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth?.user;
    const [showSidebar, setShowSidebar] = useState(true);

    // Track which sections are open
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (heading) => {
        setOpenSections((prev) => ({
            ...prev,
            [heading]: !prev[heading],
        }));
    };

    // Role-based sidebar menus grouped into sections
    const menuItems = {
        admin: [
            {
                heading: "General",
                items: [{ label: "Dashboard", route: "admin.dashboard", icon: HomeIcon }],
            },
            {
                heading: "Management",
                items: [{ label: "Users", route: "users.index", icon: UserGroupIcon }],
            },
            {
                heading: "System",
                items: [{ label: "Settings", route: "settings.index", icon: Cog6ToothIcon }],
            },
        ],
        company: [
            {
                heading: "General",
                items: [{ label: "Dashboard", route: "company.dashboard", icon: HomeIcon }],
            },
            {
                heading: "Products",
                items: [{ label: "All Products", route: "products.index", icon: CubeIcon }],
            },
            {
                heading: "Warehouses",
                items: [
                    { label: "Manage Warehouses", route: "warehouses.index", icon: BuildingOfficeIcon },
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
                items: [{ label: "Stock Management", route: "stock.index", icon: CubeIcon }],
            },
        ],
        shop: [
            {
                heading: "General",
                items: [{ label: "Dashboard", route: "shop.dashboard", icon: HomeIcon }],
            },
            {
                heading: "Operations",
                items: [
                    { label: "Request Products", route: "requests.index", icon: BuildingStorefrontIcon },
                ],
            },
        ],
    };

    const currentMenu = menuItems[user?.role] || [];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`${
                    showSidebar ? "w-64" : "w-16"
                } bg-white border-r transition-all duration-200`}
            >
                <div className="flex items-center justify-between p-4">
                    <Link href={route("dashboard")}>
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowSidebar((prev) => !prev)}
                    >
                        {showSidebar ? "«" : "»"}
                    </button>
                </div>

                {/* Sidebar Sections */}
                <nav className="mt-6 space-y-2">
                    {currentMenu.map((section) => {
                        const isOpen = openSections[section.heading] ?? true; // default open
                        return (
                            <div key={section.heading}>
                                {/* Section Heading */}
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

                                {/* Section Items */}
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
            <div className="flex flex-1 flex-col">
                {/* Top Bar */}
                <nav className="border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    {/* Page Header */}
                    {header && (
                        <h2 className="text-lg font-semibold text-gray-800">
                            {header}
                        </h2>
                    )}
                    {/* User Dropdown */}
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
                            <Dropdown.Link href={route("profile.edit")}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route("logout")}
                                method="post"
                                as="button"
                            >
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </nav>

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
