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

        return Inertia::render('Company/WarehouseAdminIndex', [
            'warehouseAdmins' => $warehouseAdmins,
            'auth' => auth()->user(),
            'flash' => session()->get('success'),
            'warehouses' => $company->warehouses, // needed for modal select
        ]);
    }

    // Show create form (optional, may not be used if modal)
    public function create()
    {
        $warehouses = auth()->user()->company->warehouses;
        return Inertia::render('Company/WarehouseAdminCreate', [
            'warehouses' => $warehouses,
            'auth' => auth()->user(),
        ]);
    }

    // Store single admin
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'warehouse_id' => 'required|exists:warehouses,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        WarehouseAdmin::create([
            'user_id' => $user->id,
            'warehouse_id' => $request->warehouse_id,
        ]);

        return redirect()->route('company.warehouse-admins.index')
            ->with('success', 'Warehouse Admin created successfully.');
    }

    // Store multiple admins at once
    public function storeMultiple(Request $request)
    {
        $company = auth()->user()->company;
        if (!$company) {
            abort(400, 'No company record found for this user.');
        }

        $adminsData = $request->input('admins', []);

        if (empty($adminsData)) {
            return redirect()->back()->withErrors('No admins to add.');
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

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            WarehouseAdmin::create([
                'user_id' => $user->id,
                'warehouse_id' => $validated['warehouse_id'],
            ]);

            $createdCount++;
        }

        return redirect()->route('company.warehouse-admins.index')
            ->with('success', "$createdCount warehouse admin(s) created successfully.");
    }

    // Delete admin
    public function destroy($id)
    {
        $admin = WarehouseAdmin::findOrFail($id);
        $admin->user()->delete(); // delete user as well
        $admin->delete();

        return redirect()->route('company.warehouse-admins.index')
            ->with('success', 'Warehouse Admin deleted successfully.');
    }
}
