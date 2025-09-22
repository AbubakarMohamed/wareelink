<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Company;
use App\Models\WarehouseAdmin;

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
    }
}
