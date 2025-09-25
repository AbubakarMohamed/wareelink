<?php
namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\WarehouseStock;
use Inertia\Inertia;

class ShopInventoryController extends Controller
{
    public function index()
    {
        $stocks = WarehouseStock::with([
            'product:id,name,price',
            'warehouse:id,name,location,company_id',
            'warehouse.company:id,name'
        ])
        ->where('visible_to_shop', true)
        ->get();

        return Inertia::render("Shop/Inventory/Index", [
            "stocks" => $stocks,
            "auth"   => ["user" => auth()->user()],
            "flash"  => session()->only(['success', 'error']),
        ]);
    }
}
