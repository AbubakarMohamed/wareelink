<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPerson;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DeliveryPersonController extends Controller
{
    /**
     * Show all delivery persons
     */
    public function index()
    {
        $company = auth()->user()->company;

        $deliveryPersons = DeliveryPerson::with(['user', 'warehouse'])
            ->where('company_id', $company->id)
            ->get();

        $warehouses = Warehouse::where('company_id', $company->id)->get();

        return Inertia::render('Company/DeliveryPersons/Index', [
            'deliveryPersons' => $deliveryPersons,
            'warehouses'      => $warehouses,
            'auth'            => auth()->user(),
        ]);
    }

    /**
     * Store a new delivery person
     */
    public function store(Request $request)
    {
        
        $company = auth()->user()->company;

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|string|min:6',
            'phone'       => 'required|string|max:20',
            'warehouse_id'=> 'required|exists:warehouses,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Create user account for delivery person
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create delivery person profile
        DeliveryPerson::create([
            'user_id'      => $user->id,
            'phone'        => $request->phone,
            'status'       => 'active',
            'company_id'   => $company->id,
            'warehouse_id' => $request->warehouse_id,
        ]);

        ActivityLog::record(auth()->id(), 'created', "Added new delivery person: {$user->name}");

        return redirect()->route('company.delivery-persons.index')
            ->with('success', 'Delivery person created successfully.');
    }

    /**
     * Update delivery person
     */
    public function update(Request $request, DeliveryPerson $deliveryPerson)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'email'       => "required|email|unique:users,email,{$deliveryPerson->user_id}",
            'phone'       => 'required|string|max:20',
            'warehouse_id'=> 'required|exists:warehouses,id',
            'status'      => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Update linked user
        $deliveryPerson->user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        // Update delivery person profile
        $deliveryPerson->update([
            'phone'        => $request->phone,
            'warehouse_id' => $request->warehouse_id,
            'status'       => $request->status,
        ]);

        ActivityLog::record(auth()->id(), 'updated', "Updated delivery person: {$deliveryPerson->fullName()}");

        return redirect()->route('company.delivery-persons.index')
            ->with('success', 'Delivery person updated successfully.');
    }

    /**
     * Delete delivery person
     */
    public function destroy(DeliveryPerson $deliveryPerson)
    {
        $name = $deliveryPerson->fullName();

        $deliveryPerson->user()->delete(); // delete linked user
        $deliveryPerson->delete();

        ActivityLog::record(auth()->id(), 'deleted', "Deleted delivery person: {$name}");

        return redirect()->route('company.delivery-persons.index')
            ->with('success', 'Delivery person deleted successfully.');
    }
}
