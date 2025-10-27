<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Models\WarehouseAdmin;

class UserController extends Controller
{
    // List all users
    public function index()
    {
        $users = User::with(['company', 'warehouses', 'managedWarehouses'])->get();


        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    // Create user page
    public function create()
    {
        $companies = Company::select('id', 'name')->get();

        return Inertia::render('Admin/Users/Create', [
            'companies' => $companies,
        ]);
    }

    // Store new user
public function store(Request $request)
{
    $validated = $request->validate([
        'name'        => ['required', 'string', 'max:255'],
        'email'       => ['required', 'email', 'max:255', 'unique:users,email'],
        'password'    => ['required', 'string', 'min:6'],
        'role'        => ['required', 'string', 'max:50'],
        'company_id'  => ['nullable', 'exists:companies,id'],
        'warehouse_id'=> ['nullable', 'exists:warehouses,id'],
    ]);

    if ($validated['role'] === 'warehouse_admin') {
        if (empty($validated['company_id']) || empty($validated['warehouse_id'])) {
            return back()->withErrors([
                'company_id' => 'A warehouse admin must belong to a company.',
                'warehouse_id' => 'A warehouse admin must be assigned a warehouse.'
            ]);
        }
    }

    $user = User::create([
        'name'         => $validated['name'],
        'email'        => $validated['email'],
        'password'     => Hash::make($validated['password']),
        'role'         => $validated['role'],
        'company_id'   => $validated['company_id'] ?? null,
        'warehouse_id' => $validated['warehouse_id'] ?? null,
    ]);

    // ✅ Automatically create warehouse_admin record
    if ($validated['role'] === 'warehouse_admin') {
        WarehouseAdmin::create([
            'company_id'   => $validated['company_id'],
            'user_id'      => $user->id,
            'warehouse_id' => $validated['warehouse_id'],
        ]);
    }

    return redirect()->route('admin.users.index')
        ->with('success', 'User created successfully.');
}


    // Edit page
    public function edit(User $user)
    {
        $companies = Company::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name', 'company_id')->get();

        return Inertia::render('Admin/Users/Edit', [
            'user'       => $user,
            'companies'  => $companies,
            'warehouses' => $warehouses,
        ]);
    }

    // Update existing user
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password'    => ['nullable', 'string', 'min:6'],
            'role'        => ['required', 'string', 'max:50'],
            'company_id'  => ['nullable', 'exists:companies,id'],
            'warehouse_id'=> ['nullable', 'exists:warehouses,id'],
        ]);

        if ($validated['role'] === 'warehouse_admin') {
            if (empty($validated['company_id']) || empty($validated['warehouse_id'])) {
                return back()->withErrors([
                    'company_id' => 'A warehouse admin must belong to a company.',
                    'warehouse_id' => 'A warehouse admin must be assigned a warehouse.'
                ]);
            }
        }

        $data = [
            'name'         => $validated['name'],
            'email'        => $validated['email'],
            'role'         => $validated['role'],
            'company_id'   => $validated['company_id'] ?? null,
            'warehouse_id' => $validated['warehouse_id'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    // Delete user
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
