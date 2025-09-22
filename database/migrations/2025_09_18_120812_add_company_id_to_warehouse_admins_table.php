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
    Schema::table('warehouse_admins', function (Blueprint $table) {
        $table->foreignId('company_id')->nullable()->constrained()->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_admins', function (Blueprint $table) {
            //
        });
    }
};
