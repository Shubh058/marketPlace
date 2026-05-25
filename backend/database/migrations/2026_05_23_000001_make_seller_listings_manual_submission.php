<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('seller_listings', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        DB::statement('ALTER TABLE seller_listings MODIFY product_id BIGINT UNSIGNED NULL');

        Schema::table('seller_listings', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('product_id');
            $table->string('brand')->nullable()->after('product_name');
            $table->string('category')->nullable()->after('brand');
            $table->text('description')->nullable()->after('category');
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_listings', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn(['product_name', 'brand', 'category', 'description']);
        });

        DB::statement('ALTER TABLE seller_listings MODIFY product_id BIGINT UNSIGNED NOT NULL');

        Schema::table('seller_listings', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }
};