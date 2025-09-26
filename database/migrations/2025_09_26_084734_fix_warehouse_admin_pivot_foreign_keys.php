<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('warehouse_admin_warehouse', function (Blueprint $table) {
            // First drop the old foreign key
            $table->dropForeign(['warehouse_admin_id']);

            // Now add the correct one to users table
            $table->foreign('warehouse_admin_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('warehouse_admin_warehouse', function (Blueprint $table) {
            // Rollback to original (wrong) behavior if needed
            $table->dropForeign(['warehouse_admin_id']);

            $table->foreign('warehouse_admin_id')
                  ->references('id')
                  ->on('warehouse_admins') // old reference
                  ->onDelete('cascade');
        });
    }
};
