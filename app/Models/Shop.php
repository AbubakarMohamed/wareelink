<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'location',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stockRequests()
    {
        return $this->hasMany(StockRequest::class);
    }
}
