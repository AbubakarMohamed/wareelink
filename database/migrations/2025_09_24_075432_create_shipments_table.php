<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('shipments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
        $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
        $table->foreignId('shop_id')->constrained()->onDelete('cascade');
        $table->integer('quantity');
        $table->string('status')->default('pending'); // pending, shipped, delivered
        $table->timestamp('shipped_at')->nullable();
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
