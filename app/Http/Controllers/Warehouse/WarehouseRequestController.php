<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Request as ShopRequest;
use App\Models\User; // shops are users
use App\Models\Company; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request as HttpRequest;
use App\Models\Invoice; 
use DB;

class WarehouseRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            // Admin can see all requests with warehouse's company
            $requests = ShopRequest::with([
                'stock' => function ($q) {
                    $q->with(['product', 'warehouse' => function ($wq) {
                        $wq->with('company');
                    }]);
                },
                'shop'
            ])->latest()->get();
        } else {
            // Get warehouse IDs this admin manages
            $warehouseIds = $user->managedWarehouses()->pluck('warehouses.id');

            if ($warehouseIds->isEmpty()) {
                $requests = collect();
            } else {
                $requests = ShopRequest::whereHas('stock.warehouse', function ($query) use ($warehouseIds) {
                        $query->whereIn('warehouses.id', $warehouseIds);
                    })
                    ->with([
                        'stock' => function ($q) {
                            $q->with(['product', 'warehouse' => function ($wq) {
                                $wq->with('company');
                            }]);
                        },
                        'shop'
                    ])
                    ->latest()
                    ->get();
            }
        }

        // ====== Compute shop performance =====
        $shopPerformance = DB::table('users as s')
            ->where('s.role', 'shop')
            ->leftJoin('requests as sr', 's.id', '=', 'sr.shop_id')
            ->leftJoin('invoices as i', 's.id', '=', 'i.shop_id')
            ->select(
                's.id',
                DB::raw('COUNT(DISTINCT sr.id) AS total_requests'),
                DB::raw('COUNT(DISTINCT CASE WHEN i.status="paid" THEN i.id END) AS completed')
            )
            ->groupBy('s.id')
            ->get()
            ->mapWithKeys(function ($shop) {
                $performance = (int) $shop->total_requests > 0
                    ? round(($shop->completed / $shop->total_requests) * 100, 1)
                    : 0;
                return [$shop->id => $performance];
            });

        // Attach performance to each request's shop
        $requests->map(function ($request) use ($shopPerformance) {
            $request->shop_performance = $shopPerformance[$request->shop_id] ?? 0;
            return $request;
        });

        return \Inertia\Inertia::render('Warehouse/Requests/Index', [
            'requests'  => $requests,
            'auth'      => ['user' => $user],
            'flash'     => session()->only(['success', 'error']),
        ]);
    }

    public function approve(HttpRequest $httpRequest, ShopRequest $request)
    {
        $stock = $request->stock;

        if ($stock->quantity < $request->quantity) {
            return back()->with('error', 'Not enough stock available to approve this request.');
        }

        $stock->decrement('quantity', $request->quantity);
        $request->update(['status' => 'approved']);

        return back()->with('success', 'Request approved and stock updated successfully!');
    }

    public function reject(HttpRequest $httpRequest, ShopRequest $request)
    {
        $request->update(['status' => 'rejected']);
        return back()->with('error', 'Request rejected.');
    }

    public function createInvoice(HttpRequest $httpRequest)
    {
        $requestId = $httpRequest->input('request_id');
        $request = ShopRequest::findOrFail($requestId);

        if ($request->status === 'invoiced') {
            return back()->with('error', 'Invoice already created for this request.');
        }

        $invoice = Invoice::create([
            'request_id'   => $request->id,
            'shop_id'      => $request->shop_id,
            'warehouse_id' => $request->stock->warehouse_id,
            'amount'       => $request->quantity * $request->stock->price,
        ]);

        $request->update(['status' => 'invoiced']);

        return back()->with('success', 'Invoice created successfully!');
    }
}
