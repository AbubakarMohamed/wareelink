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
    Schema::table('products', function (Blueprint $table) {
        $table->foreignId('company_id')->nullable()->constrained()->onDelete('cascade');
        $table->string('sku')->unique()->after('name');
        $table->string('category')->nullable()->after('sku');
        $table->enum('status', ['active', 'inactive'])->default('active')->after('price');
    });
}

public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        // Only drop if the foreign key exists
        if (Schema::hasColumn('products', 'company_id')) {
            try {
                $table->dropForeign(['company_id']);
            } catch (\Exception $e) {
                // ignore if FK doesn't exist
            }

            $table->dropColumn(['company_id']);
        }

        if (Schema::hasColumn('products', 'sku')) {
            $table->dropColumn('sku');
        }

        if (Schema::hasColumn('products', 'category')) {
            $table->dropColumn('category');
        }

        if (Schema::hasColumn('products', 'status')) {
            $table->dropColumn('status');
        }
    });
}


};
