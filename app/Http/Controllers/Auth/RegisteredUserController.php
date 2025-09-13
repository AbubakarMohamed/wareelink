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

        // ✅ Default role assignment
        $role = $request->role ?? 'shop';

        // ✅ Only companies can create warehouse admins
        if ($role === 'warehouse_admin' && !Auth::check()) {
            return response()->json([
                'message' => 'Unauthorized to create warehouse admin'
            ], 403);
        }

        if ($role === 'warehouse_admin' && Auth::user()->role !== 'company') {
            return response()->json([
                'message' => 'Only companies can create warehouse admins'
            ], 403);
        }

        // ✅ Create user
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $role,
        ]);

        event(new Registered($user));

        // 👤 Auto login for normal registration (not for warehouse admins)
        if ($role !== 'warehouse_admin') {
            Auth::login($user);
        }

        // ✅ JSON response for Axios
        if ($request->wantsJson()) {
            return response()->json([
                'message'      => 'Registration successful',
                'user'         => $user,
                'redirect_url' => route('dashboard'),
            ]);
        }

        // ✅ Redirect based on role
        switch ($role) {
            case 'shop':
                return redirect()->route('shop.dashboard');
            case 'company':
                return redirect()->route('company.dashboard');
            case 'admin':
                return redirect()->route('admin.dashboard');
            case 'warehouse_admin':
                return redirect()->route('warehouse.dashboard');
            default:
                return redirect()->route('dashboard');
        }
    }
}
