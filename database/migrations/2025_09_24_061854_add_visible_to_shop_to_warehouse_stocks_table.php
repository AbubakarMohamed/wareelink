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
    Schema::table('warehouse_stocks', function (Blueprint $table) {
        $table->boolean('visible_to_shop')->default(false);
    });
}

public function down()
{
    Schema::table('warehouse_stocks', function (Blueprint $table) {
        $table->dropColumn('visible_to_shop');
    });
}

};
