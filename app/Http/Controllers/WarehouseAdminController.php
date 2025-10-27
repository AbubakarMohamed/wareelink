<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseAdmin;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class WarehouseAdminController extends Controller
{
    /**
     * Display a listing of warehouse admins for the authenticated company.
     */
    public function index()
    {
        $company = Auth::user()->company;

        $warehouseAdmins = WarehouseAdmin::with('user', 'warehouse')
            ->whereHas('warehouse', fn($q) => $q->where('company_id', $company->id))
            ->get();

        return Inertia::render('Company/WarehouseAdminIndex', [
            'warehouseAdmins' => $warehouseAdmins,
            'auth' => Auth::user(),
            'flash' => session()->get('success'),
            'warehouses' => $company->warehouses, // For modal dropdowns
        ]);
    }

    /**
     * Show the form for creating a warehouse admin (if using separate page).
     */
    public function create()
    {
        $warehouses = Auth::user()->company->warehouses;

        return Inertia::render('Company/WarehouseAdminCreate', [
            'warehouses' => $warehouses,
            'auth' => Auth::user(),
        ]);
    }

    /**
     * Store a single warehouse admin.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'warehouse_id' => 'required|exists:warehouses,id',
        ]);

        $user = $this->createUser($validated);

        WarehouseAdmin::create([
            'user_id' => $user->id,
            'warehouse_id' => $validated['warehouse_id'],
        ]);

        return redirect()->route('company.warehouse-admins.index')
            ->with('success', "Warehouse Admin '{$validated['name']}' created successfully.");
    }

    /**
     * Store multiple warehouse admins at once.
     */
    public function storeMultiple(Request $request)
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(400, 'No company record found for this user.');
        }

        $adminsData = $request->input('admins', []);

        if (empty($adminsData)) {
            return redirect()->back()->withErrors('No admins provided for creation.');
        }

        $createdCount = 0;

        foreach ($adminsData as $index => $admin) {
            $validator = Validator::make($admin, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'warehouse_id' => 'required|exists:warehouses,id',
            ]);

            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            $user = $this->createUser($validated);

            WarehouseAdmin::create([
                'user_id' => $user->id,
                'warehouse_id' => $validated['warehouse_id'],
            ]);

            $createdCount++;
        }

        return redirect()->route('company.warehouse-admins.index')
            ->with('success', "$createdCount warehouse admin(s) created successfully.");
    }

    /**
     * Delete a warehouse admin and the associated user account.
     */
    public function destroy($id)
    {
        $admin = WarehouseAdmin::findOrFail($id);

        $adminName = $admin->user->name;
        $admin->user()->delete(); // Remove the user
        $admin->delete();

        return redirect()->route('company.warehouse-admins.index')
            ->with('success', "Warehouse Admin '{$adminName}' deleted successfully.");
    }

    /**
     * Helper method to create a user with hashed password.
     */
    private function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }
}
