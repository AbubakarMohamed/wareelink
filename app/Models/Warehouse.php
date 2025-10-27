<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ActivityLog;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'location',
        'capacity',
        'status',
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($warehouse) {
            ActivityLog::record(auth()->id(), 'created', "Created warehouse: {$warehouse->name}", $warehouse);
        });

        static::updated(function ($warehouse) {
            ActivityLog::record(auth()->id(), 'updated', "Updated warehouse: {$warehouse->name}", $warehouse);
        });

        static::deleted(function ($warehouse) {
            ActivityLog::record(auth()->id(), 'deleted', "Deleted warehouse: {$warehouse->name}", $warehouse);
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
// ✅ Add this
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function admins()
    {
        // Assuming WarehouseAdmin is a User-type model
        return $this->belongsToMany(WarehouseAdmin::class, 'warehouse_admin_warehouse')
                    ->withTimestamps();
    }

    public function stockRequests()
    {
        return $this->hasMany(StockRequest::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Helpers
    |--------------------------------------------------------------------------
    */

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function availableCapacity(): int
    {
        $usedCapacity = $this->stocks()->sum('quantity');
        return max(0, $this->capacity - $usedCapacity);
    }
}
