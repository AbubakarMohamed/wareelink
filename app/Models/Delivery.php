<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ActivityLog;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'delivery_person_id',
        'company_id',
        'warehouse_id',
        'quantity',
        'status', // pending, in_transit, acknowledged, completed
        'pickup_ack_at',
        'delivery_note_number',  // optional reference
    ];

    protected $casts = [
        'pickup_ack_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($delivery) {
            ActivityLog::record(
                auth()->id(),
                'created',
                "Created delivery for product #{$delivery->product_id}, qty {$delivery->quantity}",
                $delivery
            );
        });

        static::updated(function ($delivery) {
            ActivityLog::record(
                auth()->id(),
                'updated',
                "Updated delivery #{$delivery->id} status to {$delivery->status}",
                $delivery
            );
        });

        static::deleted(function ($delivery) {
            ActivityLog::record(
                auth()->id(),
                'deleted',
                "Deleted delivery #{$delivery->id}",
                $delivery
            );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPerson::class, 'delivery_person_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function acknowledgement()
    {
        return $this->hasOne(DeliveryAcknowledgement::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isInTransit(): bool
    {
        return $this->status === 'in_transit';
    }

    public function isAcknowledged(): bool
    {
        return $this->status === 'acknowledged';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
