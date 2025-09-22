<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void {
        Schema::create('shop_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_request_id')->constrained()->onDelete('cascade');
            $table->string('action'); // e.g., requested, approved, rejected
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('shop_histories');
    }
};
