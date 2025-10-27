<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Show inventory for a warehouse admin or admin.
     */
    public function index()
    {
        $user = auth()->user();

        // ✅ Allow both admin and warehouse_admin
        if (!$user || !in_array($user->role, ['warehouse_admin', 'admin'])) {
            abort(403, 'Unauthorized access.');
        }

        // ✅ Admin can view all warehouses with company and stocks
        if ($user->role === 'admin') {
            $warehouses = Warehouse::with([
                'company',           // ✅ include related company
                'stocks.product'     // ✅ include related products
            ])->get();

            return Inertia::render("Warehouse/Inventory/Index", [
                "warehouses" => $warehouses,
                "auth"       => ["user" => $user],
            ]);
        }

        // ✅ Warehouse admin view (unchanged, but include company)
        $warehouseAdmin = $user->warehouseAdmin;
        if (!$warehouseAdmin || !$warehouseAdmin->warehouse) {
            abort(404, 'No warehouse assigned to this user.');
        }

        $warehouse = $warehouseAdmin->warehouse()
            ->with(['company', 'stocks.product']) // ✅ include company here too
            ->first();

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

        // ✅ Allow both admin and warehouse_admin
        if (!$user || !in_array($user->role, ['warehouse_admin', 'admin'])) {
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
