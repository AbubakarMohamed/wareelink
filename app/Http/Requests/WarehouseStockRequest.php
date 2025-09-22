<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\Warehouse;

class WarehouseStockRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Adjust if you have authorization logic
    }

    public function rules()
    {
        return [
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $product = Product::find($this->product_id);
                    $warehouse = Warehouse::find($this->warehouse_id);

                    if (!$product) {
                        return $fail('Product not found.');
                    }

                    if (!$warehouse) {
                        return $fail('Warehouse not found.');
                    }

                    // ✅ Check remaining product stock
                    $totalAllocated = WarehouseStock::where('product_id', $product->id)->sum('quantity');
                    $remainingProductStock = $product->stock - $totalAllocated;

                    if ($value > $remainingProductStock) {
                        return $fail("Quantity exceeds remaining product stock. Remaining stock: {$remainingProductStock}");
                    }

                    // ✅ Check remaining warehouse capacity
                    $warehouseCurrentQty = WarehouseStock::where('warehouse_id', $warehouse->id)->sum('quantity');
                    $remainingWarehouseCapacity = $warehouse->capacity - $warehouseCurrentQty;

                    if ($remainingWarehouseCapacity <= 0) {
                        return $fail("Warehouse is full. Cannot add more stock.");
                    }

                    if ($value > $remainingWarehouseCapacity) {
                        return $fail("Warehouse capacity exceeded. Remaining space: {$remainingWarehouseCapacity}");
                    }
                },
            ],
        ];
    }

    public function messages()
    {
        return [
            'warehouse_id.required' => 'Please select a warehouse.',
            'warehouse_id.exists' => 'Selected warehouse does not exist.',
            'product_id.required' => 'Please select a product.',
            'product_id.exists' => 'Selected product does not exist.',
            'quantity.required' => 'Please enter the quantity.',
            'quantity.integer' => 'Quantity must be a number.',
            'quantity.min' => 'Quantity must be at least 1.',
        ];
    }
}
