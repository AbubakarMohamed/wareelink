<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $roles  Pipe-separated roles, e.g., "admin|company"
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized.');
        }

        $allowedRoles = explode('|', $roles);

        if (!in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
