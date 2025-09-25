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
        'status', // e.g. unpaid, paid
    ];

    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    public function shop()
    {
        return $this->belongsTo(User::class, 'shop_id'); // if shops are users
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
