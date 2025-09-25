<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Shops/Index', [
            'shops' => Shop::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Shops/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Shop::create($request->all());

        return redirect()->route('admin.shops.index')->with('success', 'Shop created successfully.');
    }

    public function edit(Shop $shop)
    {
        return Inertia::render('Admin/Shops/Edit', [
            'shop' => $shop,
        ]);
    }

    public function update(Request $request, Shop $shop)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop->update($request->all());

        return redirect()->route('admin.shops.index')->with('success', 'Shop updated successfully.');
    }

    public function destroy(Shop $shop)
    {
        $shop->delete();
        return redirect()->route('admin.shops.index')->with('success', 'Shop deleted successfully.');
    }
}
