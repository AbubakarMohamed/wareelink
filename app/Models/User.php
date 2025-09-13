<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /*
    |--------------------------------------------------------------------------
    | Role constants
    |--------------------------------------------------------------------------
    */
    public const ROLE_SHOP            = 'shop';
    public const ROLE_COMPANY         = 'company';
    public const ROLE_WAREHOUSE_ADMIN = 'warehouse_admin';
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
        'role',   // ✅ added role
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
     * Get the attributes that should be cast.
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
    | Helper methods for roles
    |--------------------------------------------------------------------------
    */
    public function isShop(): bool
    {
        return $this->role === self::ROLE_SHOP;
    }

    public function isCompany(): bool
    {
        return $this->role === self::ROLE_COMPANY;
    }

    public function isWarehouseAdmin(): bool
    {
        return $this->role === self::ROLE_WAREHOUSE_ADMIN;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }
}
