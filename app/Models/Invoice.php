<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'request_id',
        'warehouse_id',
        'shop_id',
        'amount',
        'status', // unpaid, paid
    ];

    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    public function shop()
    {
        return $this->belongsTo(User::class, 'shop_id'); // shops are users
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    // Company via warehouse
    public function company()
    {
        return $this->hasOneThrough(
            \App\Models\Company::class,   // final model
            \App\Models\Warehouse::class, // intermediate model
            'id',        // Foreign key on Warehouse table (Invoice.warehouse_id -> Warehouse.id)
            'id',        // Foreign key on Company table (Warehouse.company_id -> Company.id)
            'warehouse_id', // Local key on Invoice table
            'company_id'    // Local key on Warehouse table
        );
    }
}
