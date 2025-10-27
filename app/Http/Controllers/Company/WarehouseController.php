<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Attributes\Middleware;
use Illuminate\Support\Facades\Auth;
use App\Models\Company;

#[Middleware('auth')]
class WarehouseController extends Controller
{
    // ============================
    // ✅ INDEX 
    // ============================
    public function index()
{
    $user = auth()->user();

    if ($user->role === 'admin') {
        $warehouses = Warehouse::with('company')->latest()->get();
        $companies = Company::latest()->get(); // Admins can see/select all companies
    } elseif ($user->role === 'company') {
        $company = $user->company;
        $warehouses = $company
            ? Warehouse::with('company')->where('company_id', $company->id)->latest()->get()
            : collect();
        $companies = collect(); // company users don’t need companies list
    } else {
        $warehouses = collect();
        $companies = collect();
    }

    return Inertia::render('Company/Warehouses/Index', [
        'warehouses' => $warehouses,
        'userRole'   => $user->role,
        'companies'  => $companies, // empty for non-admins
    ]);
}


    // ============================
    // ✅ CREATE
    // ============================
    public function create()
    {
        $user = auth()->user();

        if ($user->role === 'company') {
            $company = $user->company;
            if (!$company) {
                abort(400, "No company record found for this user.");
            }
        } else {
            // Admin can choose any company
            $company = null;
        }

        $companies = Company::select('id', 'name')->get();

        return Inertia::render("Company/Warehouses/Create", [
            "company"   => $company,
            "companies" => $companies,
            "userRole"  => $user->role,
        ]);
    }

    // ============================
    // ✅ STORE (single warehouse)
    // ============================
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'location'   => 'nullable|string|max:255',
            'capacity'   => 'nullable|integer|min:0',
            'status'     => 'required|in:active,inactive',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        if ($user->role === 'company') {
            $company = $user->company;
            if (!$company) {
                abort(400, "No company record found for this user.");
            }
            $validated['company_id'] = $company->id;
        } elseif ($user->role === 'admin') {
            if (empty($validated['company_id'])) {
                abort(400, "Admin must select a company for this warehouse.");
            }
        }

        $warehouse = Warehouse::create($validated);
        $this->logActivity('warehouse_created', "🏢 Warehouse '{$warehouse->name}' was created", $warehouse);

        return redirect()->route('company.warehouses.index')
            ->with('success', 'Warehouse created successfully.');
    }

    // ============================
    // ✅ STORE MULTIPLE
    // ============================
    public function storeMultiple(Request $request)
    {
        $user = auth()->user();
        $warehousesData = $request->input('warehouses', []);

        if (empty($warehousesData)) {
            return redirect()->back()->withErrors("No warehouses to add.");
        }

        foreach ($warehousesData as $index => $w) {
            $validated = validator($w, [
                'name'       => 'required|string|max:255',
                'location'   => 'nullable|string|max:255',
                'capacity'   => 'nullable|integer|min:0',
                'status'     => 'required|in:active,inactive',
                'company_id' => 'nullable|exists:companies,id',
            ])->validate();

            if ($user->role === 'company') {
                $company = $user->company;
                if (!$company) {
                    abort(400, "No company record found for this user.");
                }
                $validated['company_id'] = $company->id;
            } elseif ($user->role === 'admin') {
                if (empty($validated['company_id'])) {
                    abort(400, "Admin must assign a company for warehouse {$w['name']}.");
                }
            }

            $warehouse = Warehouse::create($validated);
            $this->logActivity('warehouse_created', "🏢 Warehouse '{$warehouse->name}' was created", $warehouse);
        }

        return redirect()->route('company.warehouses.index')
            ->with('success', count($warehousesData) . ' warehouses added successfully.');
    }

    // ============================
    // ✅ EDIT
    // ============================
    public function edit(Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        $companies = Company::select('id', 'name')->get();

        return Inertia::render('Company/Warehouses/Edit', [
            'warehouse' => $warehouse,
            'companies' => $companies,
        ]);
    }

    // ============================
    // ✅ UPDATE
    // ============================
    public function update(Request $request, Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'location'   => 'nullable|string|max:255',
            'capacity'   => 'nullable|integer|min:0',
            'status'     => 'required|in:active,inactive',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        $warehouse->update($validated);
        $this->logActivity('warehouse_updated', "✏️ Warehouse '{$warehouse->name}' was updated", $warehouse);

        return redirect()->route('company.warehouses.index')
            ->with('success', 'Warehouse updated successfully.');
    }

    // ============================
    // ✅ DESTROY
    // ============================
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

    // ============================
    // ✅ SHOW
    // ============================
    public function show(Warehouse $warehouse)
    {
        $this->authorizeWarehouseAccess($warehouse);

        return Inertia::render('Company/Warehouses/Show', [
            'warehouse' => $warehouse,
        ]);
    }

    // ============================
    // ✅ DASHBOARDS
    // ============================
    public function companyDashboard()
    {
        $user = Auth::user();
        $warehouses = $user->role === 'admin'
            ? Warehouse::all()
            : $user->warehouses()->get();

        return Inertia::render('Company/Dashboard', compact('warehouses'));
    }

    public function adminDashboard(Warehouse $warehouse)
    {
        $warehouse->load('stocks');
        return Inertia::render('WarehouseAdmin/Dashboard', compact('warehouse'));
    }

    // ============================
    // 🔒 Helpers
    // ============================
    protected function authorizeWarehouseAccess(Warehouse $warehouse)
    {
        $user = auth()->user();

        if ($user->role === 'company') {
            $company = $user->company;
            if (!$company || $warehouse->company_id !== $company->id) {
                abort(403, 'You do not have permission to access this warehouse.');
            }
        }
        // Admin can access everything
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
}
