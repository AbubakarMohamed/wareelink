<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Delivery;
use App\Models\DeliveryPerson;
use Illuminate\Support\Facades\Auth;

class DeliveryController extends Controller
{
    // List deliveries for delivery person
    public function index()
    {
        $user = Auth::user();
        $deliveries = Delivery::where('delivery_person_id', $user->deliveryPerson->id)
            ->with('product', 'warehouse', 'company', 'acknowledgement')
            ->get();

        return view('deliveries.index', compact('deliveries'));
    }

    // Delivery person confirms pickup
    public function pickup(Delivery $delivery)
    {
        $this->authorize('update', $delivery); // optional policy

        $delivery->status = 'in_transit';
        $delivery->pickup_ack_at = now();
        $delivery->save();

        return redirect()->back()->with('success', 'Pickup confirmed.');
    }

    // Delivery person finishes delivery after ACK
    public function finish(Delivery $delivery)
{
    $this->authorize('update', $delivery);

    // Must have warehouse acknowledgement
    if (!$delivery->acknowledgement) {
        return redirect()->back()->with('error', 'Warehouse acknowledgement required first.');
    }

    $delivery->status = 'completed';
    $delivery->save();

    // Optional: update warehouse stock visibility
    return redirect()->back()->with('success', 'Delivery completed.');
}

}
