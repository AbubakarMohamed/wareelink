<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'warehouse_id',
        'shop_id',
        'quantity',
        'status',
        'shipped_at',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
