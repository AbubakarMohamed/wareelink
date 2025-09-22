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
        $table->string('phone')->nullable();
        $table->string('status')->default('active');
    });
}

public function down()
{
    Schema::table('warehouse_admins', function (Blueprint $table) {
        $table->dropColumn(['phone', 'status']);
    });
}

};
