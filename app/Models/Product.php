<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ActivityLog;

class Product extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'sku',
        'category',
        'description',
        'price',
        'status',
        'stock',   // ✅ Added stock
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($product) {
            ActivityLog::record(auth()->id(), 'created', "Created product: {$product->name}", $product);
        });

        static::updated(function ($product) {
            ActivityLog::record(auth()->id(), 'updated', "Updated product: {$product->name}", $product);
        });

        static::deleted(function ($product) {
            ActivityLog::record(auth()->id(), 'deleted', "Deleted product: {$product->name}", $product);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function stockRequestItems()
    {
        return $this->hasMany(StockRequestItem::class);
    }

    public function warehouseStocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }
}
