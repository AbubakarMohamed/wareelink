<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void {
        Schema::create('warehouse_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_admin_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['approved', 'rejected'])->default('approved');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('warehouse_approvals');
    }
};
