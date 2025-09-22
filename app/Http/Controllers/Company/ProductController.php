<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Attributes\Middleware;

use Illuminate\Support\Facades\DB;

#[Middleware('auth')]
class ProductController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            $products = Product::latest()->get();
        } elseif ($user->role === 'company') {
            $company = $user->company;
            $products = $company 
                ? Product::where('company_id', $company->id)->latest()->get()
                : collect();
        } else {
            $products = collect();
        }

        return Inertia::render("Company/Products/Index", [
            "products" => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render("Company/Products/Create");
    }

    public function store(Request $request)
    {
        // Single product creation (existing method)
        $validated = $request->validate([
            "name"        => ["required", "string", "max:255"],
            "sku"         => ["required", "string", "max:255", "unique:products,sku"],
            "category"    => ["nullable", "string", "max:255"],
            "description" => ["nullable", "string"],
            "price"       => ["required", "numeric", "min:0"],
            "status"      => ["required", "in:active,inactive"],
            "stock"       => ["required", "integer", "min:0"],
        ]);

        $company = auth()->user()->company;

        if (!$company) {
            abort(400, "No company record found for this user.");
        }

        $validated['company_id'] = $company->id;

        $product = Product::create($validated);

        $this->logActivity("product_created", "📦 Product '{$product->name}' was created", $product);

        return redirect()
            ->route("company.products.index")
            ->with("success", "Product created successfully.");
    }

    // ✅ New method to store multiple products at once
    public function storeMultiple(Request $request)
    {
        $company = auth()->user()->company;
        if (!$company) {
            abort(400, "No company record found for this user.");
        }

        $productsData = $request->input('products', []);

        if (empty($productsData)) {
            return redirect()->back()->withErrors("No products to add.");
        }

        foreach ($productsData as $index => $prod) {
            $validated = validator($prod, [
                "name"        => ["required", "string", "max:255"],
                "sku"         => ["required", "string", "max:255", "unique:products,sku"],
                "category"    => ["nullable", "string", "max:255"],
                "description" => ["nullable", "string"],
                "price"       => ["required", "numeric", "min:0"],
                "status"      => ["required", "in:active,inactive"],
                "stock"       => ["required", "integer", "min:0"],
            ])->validate();

            $validated['company_id'] = $company->id;

            $product = Product::create($validated);

            $this->logActivity("product_created", "📦 Product '{$product->name}' was created", $product);
        }

        return redirect()
            ->route("company.products.index")
            ->with("success", count($productsData) . " products added successfully.");
    }

    
    public function edit(Product $product)
    {
        $this->authorizeProductAccess($product);

        return Inertia::render("Company/Products/Edit", [
            "product" => $product,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorizeProductAccess($product);

        $validated = $request->validate([
            "name"        => ["required", "string", "max:255"],
            "sku"         => ["required", "string", "max:255", "unique:products,sku," . $product->id],
            "category"    => ["nullable", "string", "max:255"],
            "description" => ["nullable", "string"],
            "price"       => ["required", "numeric", "min:0"],
            "status"      => ["required", "in:active,inactive"],
            "stock"       => ["required", "integer", "min:0"],
        ]);

        $product->update($validated);

        $this->logActivity("product_updated", "✏️ Product '{$product->name}' was updated", $product);

        return redirect()
            ->route("company.products.index")
            ->with("success", "Product updated successfully.");
    }

    public function destroy(Product $product)
    {
        $this->authorizeProductAccess($product);

        $name = $product->name;
        $id   = $product->id;

        $product->delete();

        $this->logActivity("product_deleted", "🗑️ Product '{$name}' was deleted", [
            "id"   => $id,
            "type" => Product::class,
        ]);

        return redirect()
            ->route("company.products.index")
            ->with("success", "Product deleted successfully.");
    }

    protected function logActivity(string $action, string $description, $subject)
    {
        ActivityLog::create([
            "user_id"      => auth()->id(),
            "action"       => $action,
            "description"  => $description,
            "subject_id"   => is_array($subject) ? $subject["id"] : $subject->id,
            "subject_type" => is_array($subject) ? $subject["type"] : get_class($subject),
        ]);
    }

    protected function authorizeProductAccess(Product $product)
    {
        $user = auth()->user();

        if ($user->role === 'company') {
            $company = $user->company;
            if (!$company || $product->company_id !== $company->id) {
                abort(403, "You do not have permission to access this product.");
            }
        }
    }
}
