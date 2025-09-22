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
    Schema::table('warehouses', function (Blueprint $table) {
        // Add the 'capacity' column as a string or integer, depending on your use case.
        $table->string('capacity')->nullable(); // If it's numeric, use $table->integer('capacity')->nullable();

        // Add the 'status' column, with a default value of 'active'
        $table->string('status')->default('active');
    });
}

public function down()
{
    Schema::table('warehouses', function (Blueprint $table) {
        // Drop the 'capacity' and 'status' columns
        $table->dropColumn('capacity');
        $table->dropColumn('status');
    });
}

};
