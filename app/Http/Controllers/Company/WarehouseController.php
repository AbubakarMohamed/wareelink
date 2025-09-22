<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Attributes\Middleware;
use Illuminate\Support\Facades\Auth;

#[Middleware('auth')]
class WarehouseController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            $warehouses = Warehouse::with('company')->latest()->get();
        } elseif ($user->role === 'company') {
            $company = $user->company;
            $warehouses = $company 
                ? Warehouse::with('company')->where('company_id', $company->id)->latest()->get()
                : collect();
        } else {
            $warehouses = collect();
        }

        return Inertia::render('Company/Warehouses/Index', [
            'warehouses' => $warehouses,
            'userRole'   => $user->role,
        ]);
    }

    public function create()
    {
        $company = auth()->user()->company;

        if (!$company) {
            abort(400, "No company record found for this user.");
        }

        return Inertia::render("Company/Warehouses/Create", [
            "company" => $company,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:0',
            'status'   => 'required|in:active,inactive',
        ]);

        $company = auth()->user()->company;
        if (!$company) {
            abort(400, "No company record found for this user.");
        }

        $validated['company_id'] = $company->id;
        $warehouse = Warehouse::create($validated);

        $this->logActivity('warehouse_created', "🏢 Warehouse '{$warehouse->name}' was created", $warehouse);

        return redirect()->route('company.warehouses.index')
            ->with('success', 'Warehouse created successfully.');
    }

    // ✅ New method to store multiple warehouses
    public function storeMultiple(Request $request)
    {
        $company = auth()->user()->company;
        if (!$company) {
            abort(400, "No company record found for this user.");
        }

        $warehousesData = $request->input('warehouses', []);

        if (empty($warehousesData)) {
            return redirect()->back()->withErrors("No warehouses to add.");
        }

        foreach ($warehousesData as $index => $w) {
            $validated = validator($w, [
                'name'     => 'required|string|max:255',
                'location' => 'nullable|string|max:255',
                'capacity' => 'nullable|integer|min:0',
                'status'   => 'required|in:active,inactive',
            ])->validate();

            $validated['company_id'] = $company->id;
            $warehouse = Warehouse::create($validated);

            $this->logActivity('warehouse_created', "🏢 Warehouse '{$warehouse->name}' was created", $warehouse);
        }

        return redirect()->route('company.warehouses.index')
            ->with('success', count($warehousesData) . ' warehouses added successfully.');
    }

    public function edit(Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        return Inertia::render('Company/Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:0',
            'status'   => 'required|in:active,inactive',
        ]);

        $warehouse->update($validated);

        $this->logActivity('warehouse_updated', "✏️ Warehouse '{$warehouse->name}' was updated", $warehouse);

        return redirect()->route('company.warehouses.index')
            ->with('success', 'Warehouse updated successfully.');
    }

    public function destroy(Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        $name = $warehouse->name;
        $id   = $warehouse->id;

        $warehouse->delete();

        $this->logActivity('warehouse_deleted', "🗑️ Warehouse '{$name}' was deleted", [
            'id'   => $id,
            'type' => Warehouse::class,
        ]);

        return redirect()->route('company.warehouses.index')
            ->with('success', 'Warehouse deleted successfully.');
    }

    protected function logActivity(string $action, string $description, $subject)
    {
        ActivityLog::create([
            'user_id'      => auth()->id(),
            'action'       => $action,
            'description'  => $description,
            'subject_id'   => is_array($subject) ? $subject['id'] : $subject->id,
            'subject_type' => is_array($subject) ? $subject['type'] : get_class($subject),
        ]);
    }

    protected function authorizeWarehouseAccess(Warehouse $warehouse)
    {
        $user = auth()->user();

        if ($user->role === 'company') {
            $company = $user->company;
            if (!$company || $warehouse->company_id !== $company->id) {
                abort(403, 'You do not have permission to access this warehouse.');
            }
        }
    }

    public function show(Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        return Inertia::render('Company/Warehouses/Show', [
            'warehouse' => $warehouse,
        ]);
    }

    // ============================
    // ✅ Dashboard methods
    // ============================

    public function companyDashboard()
    {
        $warehouses = Auth::user()->warehouses()->get();
        return Inertia::render('Company/Dashboard', compact('warehouses'));
    }

    public function adminDashboard(Warehouse $warehouse)
    {
        $warehouse->load('stocks');
        return Inertia::render('WarehouseAdmin/Dashboard', compact('warehouse'));
    }
}
