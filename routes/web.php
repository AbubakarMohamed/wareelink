<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShopDashboardController;
use App\Http\Controllers\WarehouseDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Company\CompanyDashboardController;
use App\Http\Controllers\Company\ProductController;
use App\Http\Controllers\Company\WarehouseController;
use App\Http\Controllers\Company\WarehouseStockController;
use App\Http\Controllers\Warehouse\InvoiceController;
use App\Http\Controllers\Warehouse\ShipmentController;
use App\Http\Controllers\Warehouse\WarehouseReportController;
use App\Http\Controllers\Admin\ShopController;
use App\Http\Controllers\Admin\CompanyController;
// use App\Http\Controllers\Admin\WarehouseController;
// use App\Http\Controllers\Admin\InvoiceController;
// use App\Http\Controllers\WarehouseStockController;
use App\Http\Controllers\Company\WarehouseAdminController; // ✅ New
// use App\Http\Controllers\Company\AdminController;
// use App\Http\Controllers\Company\ReportController;
use App\Http\Controllers\Company\DeliveryPersonController;
use App\Http\Controllers\Company\StockReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use Illuminate\Http\Request;
use App\Models\Company;
use App\Models\Warehouse;


use App\Http\Controllers\Warehouse\InventoryController;
// use App\Http\Controllers\Warehouse\RequestController;
// use App\Http\Controllers\Warehouse\InvoiceController;
// use App\Http\Controllers\Warehouse\ShippingController;

/*
|--------------------------------------------------------------------------|
| Public Routes
|--------------------------------------------------------------------------|
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------|
| Authenticated Routes
|--------------------------------------------------------------------------|
*/
// Single dashboard route — controller redirects based on role
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Role-based dashboards
Route::get('/shop/dashboard', [ShopDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('shop.dashboard');

Route::get('/company/dashboard', [CompanyDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('company.dashboard');

Route::get('/warehouse/dashboard', [WarehouseDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('warehouse.dashboard');

Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin.dashboard');

 
        // ✅ Warehouse Stocks
    
        // List all stocks
        Route::get('warehouse-stocks', [WarehouseStockController::class, 'index'])
            ->name('warehousestocks.index');
    
        // Create stock form (optional, since we use modal)
        Route::get('warehouse-stocks/create', [WarehouseStockController::class, 'create'])
            ->name('warehousestocks.create');
    
        // Store single stock
        Route::post('warehouse-stocks', [WarehouseStockController::class, 'store'])
            ->name('warehousestocks.store');
    
        // Store multiple stocks
        Route::post('warehouse-stocks/multiple', [WarehouseStockController::class, 'storeMultiple'])
            ->name('warehousestocks.storeMultiple');
    
        // Edit stock form
        Route::get('warehouse-stocks/{warehouseStock}/edit', [WarehouseStockController::class, 'edit'])
            ->name('warehousestocks.edit');
    
        // Update stock
        Route::put('warehouse-stocks/{warehouseStock}', [WarehouseStockController::class, 'update'])
            ->name('warehousestocks.update');
    
        // Delete stock
        Route::delete('warehouse-stocks/{warehouseStock}', [WarehouseStockController::class, 'destroy'])
            ->name('warehousestocks.destroy');
    ;
    

    // use App\Http\Controllers\DeliveryController;
    // use App\Http\Controllers\DeliveryAcknowledgementController;
    
    // // Delivery person routes
    // Route::middleware(['auth'])->group(function () {
    //     Route::get('/deliveries', [DeliveryController::class, 'index'])->name('deliveries.index');
    //     Route::post('/deliveries/{delivery}/pickup', [DeliveryController::class, 'pickup'])->name('deliveries.pickup');
    //     Route::post('/deliveries/{delivery}/finish', [DeliveryController::class, 'finish'])->name('deliveries.finish');
    
    //     // Warehouse Admin ACK
    //     Route::get('/deliveries/{delivery}/acknowledge', [DeliveryAcknowledgementController::class, 'create'])->name('acknowledgements.create');
    //     Route::post('/deliveries/{delivery}/acknowledge', [DeliveryAcknowledgementController::class, 'store'])->name('acknowledgements.store');
    // });
    

/*
|--------------------------------------------------------------------------|
| Company Routes
|--------------------------------------------------------------------------|
*/
Route::middleware(['auth'])
    ->prefix('company')
    ->name('company.')
    ->group(function () {
        // ✅ Products
        Route::resource('products', ProductController::class);

        // ✅ Custom route for adding multiple products at once
        Route::post('products/multiple', [ProductController::class, 'storeMultiple'])
            ->name('products.storeMultiple');

            Route::post('/products/import', [ProductController::class, 'import'])
            ->name('company.products.import');
        

        // ✅ Warehouses
        Route::resource('warehouses', WarehouseController::class);


        // ✅ Custom route for adding multiple warehouses at once
        Route::post('warehouses/multiple', [WarehouseController::class, 'storeMultiple'])
            ->name('warehouses.storeMultiple');

        // ✅ Warehouse Stocks
        // Route::resource('warehouse-stocks', WarehouseStockController::class);


        Route::resource('warehouse-admins', WarehouseAdminController::class);

        Route::post('warehouse-admins/multiple', [WarehouseAdminController::class, 'storeMultiple'])
    ->name('warehouse-admins.storeMultiple');

//     Route::put('/', [WarehouseAdminController::class, 'update'])
//     ->name('warehouse-admins.update');

// Route::delete('/', [WarehouseAdminController::class, 'destroy'])
//     ->name('warehouse-admins.destroy');

    // ✅ Delivery Person Routes
    // Route::prefix('deliveries')->name('deliveries.')->group(function () {
    //     Route::get('/', [DeliveryController::class, 'index'])->name('index');
    //     Route::post('/{delivery}/pickup', [DeliveryController::class, 'pickup'])->name('pickup');
    //     Route::post('/{delivery}/finish', [DeliveryController::class, 'finish'])->name('finish');

    //     // Warehouse Admin ACK
    //     Route::get('/{delivery}/acknowledge', [DeliveryAcknowledgementController::class, 'create'])->name('acknowledgements.create');
    //     Route::post('/{delivery}/acknowledge', [DeliveryAcknowledgementController::class, 'store'])->name('acknowledgements.store');
    // });




    // // List all delivery persons
    // Route::get('delivery-persons', [DeliveryPersonController::class, 'index'])
    //     ->name('company.delivery-persons.index');
    
    // // Show create form
    // Route::get('delivery-persons/create', [DeliveryPersonController::class, 'create'])
    //     ->name('company.delivery-persons.create');
    
    // // Store single delivery person
    // Route::post('delivery-persons', [DeliveryPersonController::class, 'store'])
    //     ->name('company.delivery-persons.store');
    
    // // Store multiple delivery persons (optional)
    // Route::post('delivery-persons/multiple', [DeliveryPersonController::class, 'storeMultiple'])
    //     ->name('company.delivery-persons.storeMultiple');
    
    // // Show edit form
    // Route::get('delivery-persons/{deliveryPerson}/edit', [DeliveryPersonController::class, 'edit'])
    //     ->name('company.delivery-persons.edit');
    
    // // Update delivery person
    // Route::put('delivery-persons/{deliveryPerson}', [DeliveryPersonController::class, 'update'])
    //     ->name('company.delivery-persons.update');
    
    // // Delete delivery person
    // Route::delete('delivery-persons/{deliveryPerson}', [DeliveryPersonController::class, 'destroy'])
    //     ->name('company.delivery-persons.destroy');
    

    // // Index / List
    // Route::get('delivery-persons', [DeliveryPersonController::class, 'index'])
    //     ->name('company.delivery-persons.index');

    // // Single Add
    // Route::post('delivery-persons', [DeliveryPersonController::class, 'store'])
    //     ->name('company.delivery-persons.store');

    // // Update
    // Route::put('delivery-persons/{deliveryPerson}', [DeliveryPersonController::class, 'update'])
    //     ->name('company.delivery-persons.update');

    // // Delete
    // Route::delete('delivery-persons/{deliveryPerson}', [DeliveryPersonController::class, 'destroy'])
    //     ->name('company.delivery-persons.destroy');

    // // Multi Add
    // Route::post('delivery-persons/multiple', [DeliveryPersonController::class, 'storeMultiple'])
    //     ->name('company.delivery-persons.storeMultiple');
    

        // ✅ Warehouse Admins - create directly from company dashboard
        // Display all warehouse admins
     // Display all warehouse admins
     

        // Route::get('/', [WarehouseAdminController::class, 'index'])
        //     ->name('warehouse-admins.index');
    
        // Route::post('/', [WarehouseAdminController::class, 'store'])
        //     ->name('warehouse-admins.store');

        // // Store multiple admins
        // Route::post('/multiple', [WarehouseAdminController::class, 'storeMultiple'])
        // ->name('warehouse-admins.storeMultiple');
    
       
        // Route::prefix('warehouse-admins')->group(function () {
        //     // List all admins
        //     Route::get('/', [WarehouseAdminController::class, 'index'])
        //         ->name('warehouse-admins.index');
        
        //     // Store single admin
        //     Route::post('/', [WarehouseAdminController::class, 'store'])
        //         ->name('warehouse-admins.store');
        
        //     // Store multiple admins
        //     Route::post('/multiple', [WarehouseAdminController::class, 'storeMultiple'])
        //         ->name('warehouse-admins.storeMultiple');
        
        //     // Update an admin
        //     Route::put('/{id}', [WarehouseAdminController::class, 'update'])
        //         ->name('warehouse-admins.update');
        
        //     // Delete an admin
        //     Route::delete('/{id}', [WarehouseAdminController::class, 'destroy'])
        //         ->name('warehouse-admins.destroy');
        // });
    

        // // ✅ Admins
        // Route::get('admins', [AdminController::class, 'index'])->name('admins.index');
        // Route::post('admins', [AdminController::class, 'store'])->name('admins.store');

        Route::get('/stock-report', [StockReportController::class, 'index'])
        ->name('stock-report.index');

    });



    
    Route::middleware(['auth', 'verified'])
    ->prefix('warehouse')
    ->name('warehouse.')
    ->group(function () {
        // ✅ Dashboard
        Route::get('/dashboard', [WarehouseDashboardController::class, 'index'])
            ->name('dashboard');

        // ✅ Inventory (Stock Management & Visibility)
        Route::resource('inventory', InventoryController::class);
        Route::put('inventory/{id}/toggle-visibility', [InventoryController::class, 'toggleVisibility'])
            ->name('inventory.toggleVisibility'); // ✅ new route

            Route::get('requests', [\App\Http\Controllers\Warehouse\WarehouseRequestController::class, 'index'])
            ->name('requests.index');

        Route::put('requests/{request}/approve', [\App\Http\Controllers\Warehouse\WarehouseRequestController::class, 'approve'])
            ->name('requests.approve');

        Route::put('requests/{request}/reject', [\App\Http\Controllers\Warehouse\WarehouseRequestController::class, 'reject'])
            ->name('requests.reject');

        // ✅ Invoices
        Route::resource('invoices', InvoiceController::class);



Route::get('/warehouse-report', [WarehouseReportController::class, 'index'])
    ->name('warehouse.report');
    

    });


    Route::middleware(['auth', 'verified'])
    ->prefix('shop')
    ->name('shop.')
    ->group(function () {
        // ✅ Inventory visible to shops
        Route::get('innventory', [\App\Http\Controllers\Shop\ShopInventoryController::class, 'index'])
            ->name('innventory.index');

        // ✅ Requests (shop placing requests)
        Route::post('requestss', [\App\Http\Controllers\Shop\ShopRequestController::class, 'store'])
            ->name('requestss.store');
        

            Route::post('requestss/{id}/cancel', [\App\Http\Controllers\Shop\ShopRequestController::class, 'cancel'])
            ->name('requestss.cancel');
        

        // ✅ Requests List (shop can view their submitted requests)
        Route::get('requestss', [\App\Http\Controllers\Shop\ShopRequestController::class, 'index'])
            ->name('requestss.index');

            Route::get('innvoices', [\App\Http\Controllers\Shop\ShopInvoiceController::class, 'index'])
            ->name('innvoices.index');

        Route::put('innvoices/{invoice}/pay', [\App\Http\Controllers\Shop\ShopInvoiceController::class, 'pay'])
            ->name('invoices.pay');

            Route::get('purchase-history', [\App\Http\Controllers\Shop\ShopPurchaseHistoryController::class, 'index'])
            ->name('purchase-history');
    });


Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('shops', \App\Http\Controllers\Admin\ShopController::class);
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
    Route::resource('warehouses', WarehouseController::class);
    Route::resource('products', ProductController::class);
    Route::resource('inventory', InventoryController::class);
    

            
    Route::get('requests', [\App\Http\Controllers\Warehouse\WarehouseRequestController::class, 'index'])
            ->name('requests.index');

        Route::put('requests/{request}/approve', [\App\Http\Controllers\Warehouse\WarehouseRequestController::class, 'approve'])
            ->name('requests.approve');

        Route::put('requests/{request}/reject', [\App\Http\Controllers\Warehouse\WarehouseRequestController::class, 'reject'])
            ->name('requests.reject');
    
    Route::resource('invoices', InvoiceController::class);

    Route::get('/warehouse-report', [WarehouseReportController::class, 'index'])
    ->name('warehouse.report');

    Route::get('innventory', [\App\Http\Controllers\Shop\ShopInventoryController::class, 'index'])
            ->name('innventory.index');
    Route::get('requestss', [\App\Http\Controllers\Shop\ShopRequestController::class, 'index'])
            ->name('requestss.index');
    
    Route::get('innvoices', [\App\Http\Controllers\Shop\ShopInvoiceController::class, 'index'])
            ->name('innvoices.index');

    Route::put('innvoices/{invoice}/pay', [\App\Http\Controllers\Shop\ShopInvoiceController::class, 'pay'])
            ->name('invoices.pay');

    Route::get('purchase-history', [\App\Http\Controllers\Shop\ShopPurchaseHistoryController::class, 'index'])
        ->name('purchase-history');


});



Route::middleware(['auth', 'verified'])->group(function () {
    // ✅ Get all companies
    Route::get('/api/companies', function () {
        return response()->json(
            \App\Models\Company::select('id', 'name')->get()
        );
    });

    // ✅ Get warehouses belonging to a company
    Route::get('/api/companies/{company}/warehouses', function ($companyId) {
        return response()->json(
            \App\Models\Warehouse::where('company_id', $companyId)
                ->select('id', 'name')
                ->get()
        );
    });
});


/*
|--------------------------------------------------------------------------|
| Profile Routes
|--------------------------------------------------------------------------|
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
