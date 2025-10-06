<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class TestViteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (app()->environment('testing')) {
            Blade::directive('vite', function () {
                return ''; // no-op for tests
            });
        }
    }
}
