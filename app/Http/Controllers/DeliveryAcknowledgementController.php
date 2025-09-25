<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Delivery;
use App\Models\DeliveryAcknowledgement;
use Illuminate\Support\Facades\Auth;

class DeliveryAcknowledgementController extends Controller
{
    // Show ACK form for a delivery
    public function create(Delivery $delivery)
    {
        $this->authorize('acknowledge', $delivery);

        return view('acknowledgements.create', compact('delivery'));
    }

    // Store ACK
    public function store(Request $request, Delivery $delivery)
    {
        $this->authorize('acknowledge', $delivery);

        $request->validate([
            'acknowledgement' => 'required|in:full,partial,missing',
            'good_quantity' => 'nullable|integer|min:0',
            'bad_quantity' => 'nullable|integer|min:0',
            'missing_quantity' => 'nullable|integer|min:0',
            'remarks' => 'nullable|string|max:1000',
        ]);

        DeliveryAcknowledgement::create([
            'delivery_id' => $delivery->id,
            'warehouse_admin_id' => Auth::id(),
            'acknowledgement' => $request->acknowledgement,
            'good_quantity' => $request->good_quantity ?? 0,
            'bad_quantity' => $request->bad_quantity ?? 0,
            'missing_quantity' => $request->missing_quantity ?? 0,
            'remarks' => $request->remarks,
            'acknowledged_at' => now(),
        ]);

        $delivery->status = 'acknowledged';
        $delivery->save();

        return redirect()->route('deliveries.index')->with('success', 'Delivery acknowledged.');
    }
}

