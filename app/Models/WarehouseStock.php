<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ActivityLog;

class WarehouseStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_id',
        'product_id',
        'quantity',
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($stock) {
            ActivityLog::record(auth()->id(), 'created', "Added stock for product ID {$stock->product_id} in warehouse ID {$stock->warehouse_id}", $stock);
        });

        static::updated(function ($stock) {
            ActivityLog::record(auth()->id(), 'updated', "Updated stock for product ID {$stock->product_id} in warehouse ID {$stock->warehouse_id}", $stock);
        });

        static::deleted(function ($stock) {
            ActivityLog::record(auth()->id(), 'deleted', "Removed stock for product ID {$stock->product_id} in warehouse ID {$stock->warehouse_id}", $stock);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
