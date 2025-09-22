<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseAdmin;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class WarehouseAdminController extends Controller
{
    // Show all warehouse admins
    public function index()
    {
        $company = auth()->user()->company;

        $warehouseAdmins = WarehouseAdmin::with('user', 'warehouse')
            ->whereHas('warehouse', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->get();

        return Inertia::render('Company/WarehouseAdmin/Index', [
            'warehouseAdmins' => $warehouseAdmins,
            'auth' => [
                'user' => auth()->user(),
            ],
            'flash' => session()->get('success'),
            'warehouses' => $company->warehouses,
        ]);
    }

    // ✅ Show create form
    public function create()
    {
        $warehouses = auth()->user()->company?->warehouses ?? collect();

        return Inertia::render("Company/WarehouseAdmins/Create", [
            "warehouses" => $warehouses,
        ]);
    }

    // ✅ Store single warehouse admin
    public function store(Request $request)
    {
        $company = auth()->user()->company;

        $validated = $request->validate([
            "name"         => ["required", "string", "max:255"],
            "email"        => ["required", "email", "unique:users,email"],
            "password"     => ["required", "string", "min:6"],
            "warehouse_id" => ["required", "exists:warehouses,id"],
        ]);

        $user = User::create([
            "name"     => $validated["name"],
            "email"    => $validated["email"],
            "password" => Hash::make($validated["password"]),
            "role"     => "warehouse_admin",
        ]);

        $admin = WarehouseAdmin::create([
            "user_id"      => $user->id,
            "warehouse_id" => $validated["warehouse_id"],
            "company_id"   => $company->id,
        ]);

        $this->logActivity("warehouse_admin_created", "👤 Warehouse admin '{$user->name}' was created", $admin);

        return redirect()
            ->route("company.warehouse-admins.index")
            ->with("success", "Warehouse Admin created successfully.");
    }

    // ✅ Store multiple admins
    public function storeMultiple(Request $request)
    {
        $adminsData = $request->input("admins", []);
        $company = auth()->user()->company;

        if (empty($adminsData)) {
            return redirect()->back()->withErrors("No admins to add.");
        }

        foreach ($adminsData as $adminData) {
            $validated = validator($adminData, [
                "name"         => ["required", "string", "max:255"],
                "email"        => ["required", "email", "unique:users,email"],
                "password"     => ["required", "string", "min:6"],
                "warehouse_id" => ["required", "exists:warehouses,id"],
            ])->validate();

            $user = User::create([
                "name"     => $validated["name"],
                "email"    => $validated["email"],
                "password" => Hash::make($validated["password"]),
                "role"     => "warehouse_admin",
            ]);

            $admin = WarehouseAdmin::create([
                "user_id"      => $user->id,
                "warehouse_id" => $validated["warehouse_id"],
                "company_id"   => $company->id,
            ]);

            $this->logActivity("warehouse_admin_created", "👤 Warehouse admin '{$user->name}' was created", $admin);
        }

        return redirect()
            ->route("company.warehouse-admins.index")
            ->with("success", count($adminsData) . " admins added successfully.");
    }

// ✅ Edit admin
public function edit(WarehouseAdmin $warehouseAdmin)
{
    $company = auth()->user()->company;

    $warehouses = $company?->warehouses ?? collect();

    return Inertia::render("Company/WarehouseAdmins/Edit", [
        "admin"      => $warehouseAdmin->load("user", "warehouse"),
        "warehouses" => $warehouses,
    ]);
}

// ✅ Update admin
public function update(Request $request, WarehouseAdmin $warehouseAdmin)
{
    $company = auth()->user()->company;

    $validated = $request->validate([
        "name"         => ["required", "string", "max:255"],
        "email"        => ["required", "email", "unique:users,email," . $warehouseAdmin->user_id],
        "password"     => ["nullable", "string", "min:6"], // nullable password
        "warehouse_id" => ["required", "exists:warehouses,id"],
    ]);

    // Check if user exists
    $user = $warehouseAdmin->user;
    if (!$user) {
        return redirect()
            ->route('company.warehouse-admins.index')
            ->with('error', 'User for this warehouse admin not found.');
    }

    // Update user
    $user->update([
        "name"  => $validated["name"],
        "email" => $validated["email"],
        "password" => $validated["password"]
            ? Hash::make($validated["password"])
            : $user->password,
    ]);

    // Update warehouse relation
    $warehouseAdmin->update([
        "warehouse_id" => $validated["warehouse_id"],
    ]);

    return redirect()
        ->route("company.warehouse-admins.index")
        ->with("success", "Warehouse Admin updated successfully.");
}

// ✅ Destroy admin (consistent with update/edit)
public function destroy(WarehouseAdmin $warehouseAdmin)
{
    // Delete related user if exists
    if ($warehouseAdmin->user) {
        $warehouseAdmin->user->delete(); // deletes from `users` table
    }

    $warehouseAdmin->delete(); // deletes from `warehouse_admins` table

    return redirect()
        ->route('company.warehouse-admins.index')
        ->with('success', 'Warehouse Admin deleted successfully.');
}








    // ✅ Helpers
    protected function logActivity(string $action, string $description, $subject)
    {
        ActivityLog::create([
            "user_id"      => auth()->id(),
            "action"       => $action,
            "description"  => $description,
            "subject_id"   => is_array($subject) ? $subject["id"] : $subject->id,
            "subject_type" => is_array($subject) ? $subject["type"] : get_class($subject),
        ]);
    }

    protected function authorizeAdminAccess(WarehouseAdmin $warehouseAdmin)
    {
        $user = auth()->user();

        if ($user->role === 'company') {
            $company = $user->company;
            if (!$company || !$warehouseAdmin->warehouse || $warehouseAdmin->warehouse->company_id !== $company->id) {
                abort(403, "You do not have permission to access this warehouse admin.");
            }
        }
    }
}