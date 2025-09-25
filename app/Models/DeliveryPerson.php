<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ActivityLog;

class DeliveryPerson extends Model
{
    use HasFactory;

    protected $table = 'delivery_persons';

    protected $fillable = [
        'user_id',
        'phone',
        'status',      // e.g. active/inactive
        'company_id',  // which company they belong to
        'warehouse_id',
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Method for Activity Logging
    |--------------------------------------------------------------------------
    */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($deliveryPerson) {
            ActivityLog::record(
                auth()->id(),
                'created',
                "Created delivery person: {$deliveryPerson->fullName()}",
                $deliveryPerson
            );
        });

        static::updated(function ($deliveryPerson) {
            ActivityLog::record(
                auth()->id(),
                'updated',
                "Updated delivery person: {$deliveryPerson->fullName()}",
                $deliveryPerson
            );
        });

        static::deleted(function ($deliveryPerson) {
            ActivityLog::record(
                auth()->id(),
                'deleted',
                "Deleted delivery person: {$deliveryPerson->fullName()}",
                $deliveryPerson
            );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'delivery_person_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */
    public function fullName(): string
    {
        return $this->user?->name ?? 'Unknown Delivery Person';
    }
}
