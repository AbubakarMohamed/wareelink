<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;

class StockRequestItem extends Model
{
    protected $fillable = [
        'stock_request_id',
        'product_id',
        'quantity_requested',
        'quantity_approved',
        'status',   // pending | approved | rejected | partially_approved
        'remarks',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */
    public function stockRequest()
    {
        return $this->belongsTo(StockRequest::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic with Automatic Rollback
    |--------------------------------------------------------------------------
    */
    public function approve(int $approvedQuantity): void
    {
        DB::beginTransaction();

        try {
            $previousApproved = $this->quantity_approved; // track old value
            $previousStatus   = $this->status;

            $this->quantity_approved = $approvedQuantity;

            if ($approvedQuantity === 0) {
                $this->status  = 'rejected';
                $this->remarks = 'Rejected due to insufficient stock.';
            } elseif ($approvedQuantity < $this->quantity_requested) {
                $this->status  = 'partially_approved';
                $this->remarks = 'Partially approved due to limited stock.';
            } else {
                $this->status = 'approved';
            }

            $this->save();

            // Sync stock changes
            $this->syncWarehouseStock($previousApproved, $previousStatus);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();

            // Roll back changes on this item
            $this->status  = 'pending';
            $this->remarks = 'Approval failed, transaction rolled back.';
            $this->saveQuietly();

            throw $e;
        }
    }

    /**
     * Sync warehouse stock based on old vs new approval state.
     */
    private function syncWarehouseStock(int $previousApproved, ?string $previousStatus): void
    {
        $warehouseId = $this->stockRequest->warehouse_id;

        $warehouseStock = WarehouseStock::where('warehouse_id', $warehouseId)
            ->where('product_id', $this->product_id)
            ->lockForUpdate()
            ->first();

        if (!$warehouseStock) {
            throw new Exception("No stock record found for product {$this->product_id} in warehouse {$warehouseId}.");
        }

        // CASE 1: Item was previously approved/partially_approved → now reduced or rejected → restore stock
        if (in_array($previousStatus, ['approved', 'partially_approved']) &&
            in_array($this->status, ['rejected', 'partially_approved'])) {

            $restoreQty = max(0, $previousApproved - $this->quantity_approved);
            if ($restoreQty > 0) {
                $warehouseStock->increment('quantity', $restoreQty);
            }
        }

        // CASE 2: Item newly approved/partially_approved OR approval increased → deduct more stock
        if (in_array($this->status, ['approved', 'partially_approved'])) {
            $deductQty = max(0, $this->quantity_approved - $previousApproved);
            if ($deductQty > 0) {
                if ($warehouseStock->quantity < $deductQty) {
                    throw new Exception("Not enough stock to approve {$deductQty} units.");
                }
                $warehouseStock->decrement('quantity', $deductQty);
            }
        }
    }
}
