<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('warehouse_admins', function (Blueprint $table) {
            if (!Schema::hasColumn('warehouse_admins', 'warehouse_id')) {
                $table->foreignId('warehouse_id')
                      ->constrained('warehouses')
                      ->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('warehouse_admins', function (Blueprint $table) {
            $table->dropForeign(['warehouse_id']);
            $table->dropColumn('warehouse_id');
        });
    }
};
