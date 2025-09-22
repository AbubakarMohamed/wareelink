<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show registration page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role'     => 'nullable|string|in:shop,company,warehouse_admin,admin',
        ]);

        // ✅ Default role assignment (fallback = shop)
        $role = $request->role ?? 'shop';

        // ✅ Only companies can create warehouse admins
        if ($role === 'warehouse_admin') {
            if (!Auth::check() || Auth::user()->role !== 'company') {
                return response()->json([
                    'message' => 'Only authenticated companies can create warehouse admins'
                ], 403);
            }
        }

        // ✅ Create user
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $role,
        ]);

        event(new Registered($user));

        // 👤 Auto login for normal registration (not warehouse_admin)
        if ($role !== 'warehouse_admin') {
            Auth::login($user);
        }

        // ✅ Decide redirect based on role
        $redirects = [
            'shop'            => route('shop.dashboard'),
            'company'         => route('company.dashboard'),
            'admin'           => route('admin.dashboard'),
            'warehouse_admin' => route('warehouse.dashboard'),
        ];

        $redirectUrl = $redirects[$role] ?? route('dashboard');

        // ✅ JSON response for API/Axios requests
        if ($request->wantsJson()) {
            return response()->json([
                'message'      => 'Registration successful',
                'user'         => $user,
                'redirect_url' => $redirectUrl,
            ]);
        }

        // ✅ Default redirect
        return redirect()->to($redirectUrl);
    }
}
