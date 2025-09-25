<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /*
    |--------------------------------------------------------------------------
    | Role constants
    |--------------------------------------------------------------------------
    */
    public const ROLE_SHOP            = 'shop';
    public const ROLE_COMPANY         = 'company';
    public const ROLE_WAREHOUSE_ADMIN = 'warehouse_admin';
    public const ROLE_DELIVERY_PERSON = 'delivery_person';
    public const ROLE_ADMIN           = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Company profile (one-to-one)
    public function company()
    {
        return $this->hasOne(Company::class, 'user_id');
    }

    // Delivery person profile (one-to-one)
public function deliveryPerson()
{
    return $this->hasOne(DeliveryPerson::class, 'user_id');
}


    // WarehouseAdmin profile (one-to-one)
    public function warehouseAdmin()
    {
        return $this->hasOne(WarehouseAdmin::class, 'user_id');
    }

    // Shops: stock requests they’ve made
    public function stockRequests()
    {
        return $this->hasMany(StockRequest::class, 'shop_id');
    }

    // Companies: products they own
    public function products()
    {
        return $this->hasMany(Product::class, 'company_id');
    }

    // Companies: warehouses they created
    public function warehouses()
    {
        return $this->hasMany(Warehouse::class, 'company_id');
    }

    // Warehouse admins: warehouses they manage (many-to-many through profile)
    public function managedWarehouses()
    {
        return $this->belongsToMany(
            Warehouse::class,
            'warehouse_admin_warehouse', // pivot table
            'warehouse_admin_id',        // foreign key on pivot (profile id)
            'warehouse_id'               // related warehouse key
        )->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Role helper methods (wrap Spatie hasRole())
    |--------------------------------------------------------------------------
    */
    public function isShop(): bool
    {
        return $this->hasRole(self::ROLE_SHOP);
    }

    public function isCompany(): bool
    {
        return $this->hasRole(self::ROLE_COMPANY);
    }

    public function isDeliveryPerson(): bool
{
    return $this->hasRole(self::ROLE_DELIVERY_PERSON);
}


    public function isWarehouseAdmin(): bool
    {
        return $this->hasRole(self::ROLE_WAREHOUSE_ADMIN);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(self::ROLE_ADMIN);
    }
}
