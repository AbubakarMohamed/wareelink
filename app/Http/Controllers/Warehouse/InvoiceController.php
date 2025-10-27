<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Request as ShopRequest;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    // List all invoices (warehouse admins see theirs, admin sees all)
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            // Admin sees all invoices
            $invoices = Invoice::with([
                'request.stock.product',
                'shop',
                'warehouse',
                'company' // via warehouse
            ])->latest()->get();
        } else {
            // Warehouse admin: only invoices for their warehouses
            $warehouseIds = $user->managedWarehouses()->pluck('warehouses.id');

            if ($warehouseIds->isEmpty()) {
                $invoices = collect();
            } else {
                $invoices = Invoice::whereIn('warehouse_id', $warehouseIds)
                    ->with([
                        'request.stock.product',
                        'shop',
                        'warehouse',
                        'company'
                    ])->latest()->get();
            }
        }

        return Inertia::render('Warehouse/Invoices/Index', [
            'invoices' => $invoices,
            'auth'     => ['user' => $user],
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    // Store a new invoice
    public function store(HttpRequest $request)
    {
        $request->validate([
            'request_id' => 'required|exists:requests,id',
        ]);

        $shopRequest = ShopRequest::with('stock.product', 'stock.warehouse')
            ->findOrFail($request->request_id);

        if ($shopRequest->status !== 'approved') {
            return back()->with('error', 'Invoice can only be created for approved requests.');
        }

        if (Invoice::where('request_id', $shopRequest->id)->exists()) {
            return back()->with('error', 'Invoice already exists for this request.');
        }

        $amount = $shopRequest->quantity * ($shopRequest->stock->product->price ?? 0);

        Invoice::create([
            'request_id'   => $shopRequest->id,
            'warehouse_id' => $shopRequest->stock->warehouse_id,
            'shop_id'      => $shopRequest->shop_id,
            'amount'       => $amount,
            'status'       => 'unpaid',
        ]);

        $shopRequest->update(['status' => 'invoiced']);

        return back()->with('success', 'Invoice created successfully.');
    }
}
