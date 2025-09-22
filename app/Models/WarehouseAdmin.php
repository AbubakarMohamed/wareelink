<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ActivityLog;

class WarehouseAdmin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'status',
        'company_id',
        'warehouse_id'
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($admin) {
            ActivityLog::record(auth()->id(), 'created', "Created warehouse admin: {$admin->fullName()}", $admin);
        });

        static::updated(function ($admin) {
            ActivityLog::record(auth()->id(), 'updated', "Updated warehouse admin: {$admin->fullName()}", $admin);
        });

        static::deleted(function ($admin) {
            ActivityLog::record(auth()->id(), 'deleted', "Deleted warehouse admin: {$admin->fullName()}", $admin);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Primary assigned warehouse
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    // Optional multi-warehouse pivot
    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'warehouse_admin_warehouse')
                    ->withTimestamps();
    }

    public function fullName(): string
    {
        return $this->user?->name ?? 'Unknown Admin';
    }

    public function hasWarehouse(int $warehouseId): bool
    {
        return $this->warehouses()->where('warehouse_id', $warehouseId)->exists();
    }
}
