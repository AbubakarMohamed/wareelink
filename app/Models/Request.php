<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Request extends Model
{
    use HasFactory;

    protected $fillable = ['shop_id', 'warehouse_stock_id', 'quantity', 'status'];

    public function shop()
    {
        return $this->belongsTo(User::class, 'shop_id');
    }

    public function stock()
    {
        return $this->belongsTo(WarehouseStock::class, 'warehouse_stock_id');
    }
}
