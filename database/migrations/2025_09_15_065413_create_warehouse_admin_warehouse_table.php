<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('warehouse_admin_warehouse', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('warehouse_id');
            $table->unsignedBigInteger('warehouse_admin_id');
            $table->timestamps();
        
            $table->foreign('warehouse_id')
                  ->references('id')
                  ->on('warehouses')
                  ->onDelete('cascade');
        
            $table->foreign('warehouse_admin_id')
                  ->references('id')
                  ->on('warehouse_admins') // points to profile table
                  ->onDelete('cascade');
        
            $table->unique(['warehouse_id', 'warehouse_admin_id']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_admin_warehouse');
    }
};
