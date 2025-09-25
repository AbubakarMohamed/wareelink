<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'registration_no',
        'address',
        'status',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Owner of the company (registered user).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Products that belong to the company.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Warehouses owned by the company.
     */
    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }

    /**
     * Employees (warehouse admins) working in the company.
     */
    public function warehouseAdmins()
    {
        return $this->hasMany(WarehouseAdmin::class);
    }

    public function DeliveryPerson()
    {
        return $this->hasMany(DeliveryPerson::class);
    }

    /**
     * Stock requests made through company warehouses.
     */
    public function stockRequests()
    {
        return $this->hasManyThrough(
            StockRequest::class,
            Warehouse::class,
            'company_id',   // Foreign key on warehouses
            'warehouse_id'  // Foreign key on stock_requests
        );
    }

    /**
     * Activity logs related to this company.
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
