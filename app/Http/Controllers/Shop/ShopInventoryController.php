<?php
namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\WarehouseStock;
use App\Models\User; // shops are users
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Request as StockRequest;
use Inertia\Inertia;
use DB;

class ShopInventoryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Fetch stocks visible to shops
        $stocks = WarehouseStock::with([
            'product:id,name,price',
            'warehouse:id,name,location,company_id',
            'warehouse.company:id,name'
        ])
        ->where('visible_to_shop', true)
        ->get();

        // Only admins get a list of shops
        $shops = [];
        if ($user->role === 'admin') {
            $shops = User::where('role', 'shop')->select('id', 'name')->get();
        }

        // ===== Compute company performance =====
        $topCompanies = DB::table('companies')
            ->leftJoin('warehouses', 'companies.id', '=', 'warehouses.company_id')
            ->leftJoin('warehouse_stocks as ws', 'warehouses.id', '=', 'ws.warehouse_id')
            ->leftJoin('requests as r', 'ws.id', '=', 'r.warehouse_stock_id')
            ->leftJoin('invoices', 'warehouses.id', '=', 'invoices.warehouse_id')
            ->selectRaw('companies.id, companies.name, COUNT(DISTINCT r.id) AS total_requests, COUNT(DISTINCT CASE WHEN invoices.status="paid" AND r.status IN ("approved","invoiced") THEN invoices.id END) AS completed')
            ->groupBy('companies.id', 'companies.name')
            ->get()
            ->mapWithKeys(function($c){
                $performance = $c->total_requests > 0 ? round(($c->completed / $c->total_requests)*100,1) : 0;
                return [$c->name => $performance];
            });

        // Attach performance to each stock
        $stocks->map(function($stock) use ($topCompanies) {
            $companyName = $stock->warehouse->company->name ?? null;
            $stock->performance = $companyName ? ($topCompanies[$companyName] ?? 0) : 0;
            return $stock;
        });

        return Inertia::render("Shop/Inventory/Index", [
            "stocks" => $stocks,
            "shops"  => $shops,
            "auth"   => ["user" => $user],
            "flash"  => session()->only(['success', 'error']),
        ]);
    }
}
