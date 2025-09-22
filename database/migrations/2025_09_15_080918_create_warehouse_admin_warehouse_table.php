<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('warehouse_admin_warehouse', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_admin_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['warehouse_id', 'warehouse_admin_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_admin_warehouse');
    }
};
