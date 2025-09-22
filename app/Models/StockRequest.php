<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class StockRequest extends Model
{
    /*
    |--------------------------------------------------------------------------
    | Status Constants
    |--------------------------------------------------------------------------
    */
    public const STATUS_PENDING            = 'pending';
    public const STATUS_APPROVED           = 'approved';
    public const STATUS_PARTIALLY_APPROVED = 'partially_approved';
    public const STATUS_REJECTED           = 'rejected';
    public const STATUS_DISPATCHED         = 'dispatched';
    public const STATUS_FULFILLED          = 'fulfilled';

    protected $fillable = [
        'shop_id',
        'warehouse_id',
        'status',   // pending | approved | partially_approved | rejected | dispatched | fulfilled
        'remarks',  // notes from warehouse admin
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockRequestItem::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Status Helpers
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isPartiallyApproved(): bool
    {
        return $this->status === self::STATUS_PARTIALLY_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isDispatched(): bool
    {
        return $this->status === self::STATUS_DISPATCHED;
    }

    public function isFulfilled(): bool
    {
        return $this->status === self::STATUS_FULFILLED;
    }

    /*
    |--------------------------------------------------------------------------
    | Aggregate Logic
    |--------------------------------------------------------------------------
    */

    /**
     * Determine overall status based on child item statuses.
     * Called automatically whenever an item is approved/rejected/rolled back.
     */
    public function updateStatusFromItems(): void
    {
        $itemStatuses = $this->items()->pluck('status')->unique();

        if ($itemStatuses->isEmpty()) {
            $this->status = self::STATUS_PENDING;
        } elseif ($itemStatuses->contains(self::STATUS_PENDING)) {
            $this->status = self::STATUS_PENDING;
        } elseif ($itemStatuses->every(fn ($s) => $s === self::STATUS_APPROVED)) {
            $this->status = self::STATUS_APPROVED;
        } elseif ($itemStatuses->every(fn ($s) => $s === self::STATUS_REJECTED)) {
            $this->status = self::STATUS_REJECTED;
        } elseif ($itemStatuses->contains(self::STATUS_PARTIALLY_APPROVED)) {
            $this->status = self::STATUS_PARTIALLY_APPROVED;
        }

        $this->save();
    }

    /**
     * Dispatch the stock request if all items are approved or partially approved.
     */
    public function dispatchIfReady(): void
    {
        $hasBlockingItems = $this->items()
            ->whereNotIn('status', [self::STATUS_APPROVED, self::STATUS_PARTIALLY_APPROVED])
            ->exists();

        if (! $hasBlockingItems) {
            $this->status = self::STATUS_DISPATCHED;
            $this->save();
        }
    }
}
