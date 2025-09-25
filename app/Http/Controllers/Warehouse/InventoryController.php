<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\WarehouseStock; // ✅ corrected import
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Show inventory for a warehouse admin.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'warehouse_admin') {
            abort(403, 'Unauthorized access.');
        }

        $warehouseAdmin = $user->warehouseAdmin;
        if (!$warehouseAdmin || !$warehouseAdmin->warehouse) {
            abort(404, 'No warehouse assigned to this user.');
        }

        $warehouse = $warehouseAdmin->warehouse()->with(['stocks.product'])->first();

        return Inertia::render("Warehouse/Inventory/Index", [
            "warehouse" => $warehouse,
            "auth"      => ["user" => $user],
        ]);
    }

    /**
     * Toggle shop visibility for a stock item.
     */
    public function toggleVisibility(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'warehouse_admin') {
            abort(403, 'Unauthorized access.');
        }

        $stock = WarehouseStock::findOrFail($id);

        $stock->visible_to_shop = !$stock->visible_to_shop;
        $stock->save();

        ActivityLog::record(
            $user->id,
            'updated',
            $stock->visible_to_shop 
                ? "Made stock {$stock->id} visible to shops" 
                : "Made stock {$stock->id} hidden from shops",
            $stock
        );

        return back()->with('success', 'Stock visibility updated.');
    }
}
