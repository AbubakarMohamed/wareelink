<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ActivityLog;

class DeliveryAcknowledgement extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_id',
        'warehouse_admin_id',
        'acknowledgement',   // full / partial / missing
        'good_quantity',     // qty received in good condition
        'bad_quantity',      // qty damaged
        'missing_quantity',  // qty missing
        'remarks',           // free text
        'acknowledged_at',   // timestamp when admin submitted
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
        'good_quantity'   => 'integer',
        'bad_quantity'    => 'integer',
        'missing_quantity'=> 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($ack) {
            ActivityLog::record(
                auth()->id(),
                'created',
                "Acknowledgement created for delivery #{$ack->delivery_id}",
                $ack
            );
        });

        static::updated(function ($ack) {
            ActivityLog::record(
                auth()->id(),
                'updated',
                "Acknowledgement updated for delivery #{$ack->delivery_id}",
                $ack
            );
        });

        static::deleted(function ($ack) {
            ActivityLog::record(
                auth()->id(),
                'deleted',
                "Acknowledgement deleted for delivery #{$ack->delivery_id}",
                $ack
            );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */
    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }

    public function warehouseAdmin()
    {
        return $this->belongsTo(User::class, 'warehouse_admin_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */
    public function isFull(): bool
    {
        return $this->acknowledgement === 'full';
    }

    public function isPartial(): bool
    {
        return $this->acknowledgement === 'partial';
    }

    public function isMissing(): bool
    {
        return $this->acknowledgement === 'missing';
    }

    /**
     * Total acknowledged quantity
     */
    public function totalAcknowledged(): int
    {
        return ($this->good_quantity ?? 0) + ($this->bad_quantity ?? 0) + ($this->missing_quantity ?? 0);
    }

    /**
     * Check if acknowledged quantity matches delivery
     */
    public function matchesDeliveryQuantity(): bool
    {
        return $this->delivery && $this->totalAcknowledged() === $this->delivery->quantity;
    }
}
