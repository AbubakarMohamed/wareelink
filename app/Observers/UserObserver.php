<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Company;
use App\Models\WarehouseAdmin;
use App\Models\Shop;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Automatically create Company profile if role is 'company'
        if ($user->role === User::ROLE_COMPANY) {
            Company::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'            => $user->name ?? "Company #{$user->id}",
                    'registration_no' => 'REG-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                    'status'          => 'active',
                ]
            );
        }

        // Automatically create Shop profile if role is 'shop'
        if ($user->role === User::ROLE_SHOP) {
            Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'     => $user->name ?? "Shop #{$user->id}",
                    'location' => 'Location for Shop #' . $user->id, // You can modify this to accept a location if needed
                ]
            );
        }

        // Don't create WarehouseAdmin automatically here
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // If the role changed to 'company' and no company exists, create one
        if ($user->role === User::ROLE_COMPANY && !$user->company) {
            Company::create([
                'user_id'         => $user->id,
                'name'            => $user->name ?? "Company #{$user->id}",
                'registration_no' => 'REG-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                'status'          => 'active',
            ]);
        }

        // If the role changed to 'warehouse_admin' and no profile exists, create one
        if ($user->role === User::ROLE_WAREHOUSE_ADMIN && !$user->warehouseAdmin) {
            WarehouseAdmin::create([
                'user_id' => $user->id,
                'phone'   => null,
                'status'  => 'active',
            ]);
        }

        // If the role changed to 'shop' and no shop profile exists, create one
        if ($user->role === User::ROLE_SHOP && !$user->shop) {
            Shop::create([
                'user_id'  => $user->id,
                'name'     => $user->name ?? "Shop #{$user->id}",
                'location' => 'Location for Shop #' . $user->id, // Modify this as needed
            ]);
        }
    }
}
