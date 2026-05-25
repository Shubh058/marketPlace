<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $demoKeys = [
            'APPLE-IP15PM-XYZ890',
            'NIKE-AM90-CLASSIC123',
            'NIKE-DRIFIT-TSHIRT456',
            'SONY-XM5-NOISECANCEL456',
        ];

        DB::transaction(function () use ($demoKeys) {
            $listingIds = DB::table('seller_listings')
                ->join('products', 'seller_listings.product_id', '=', 'products.id')
                ->whereIn('products.original_auth_key', $demoKeys)
                ->pluck('seller_listings.id');

            if ($listingIds->isNotEmpty()) {
                DB::table('verification_logs')->whereIn('listing_id', $listingIds)->delete();
                DB::table('counterfeit_reports')->whereIn('listing_id', $listingIds)->delete();
                DB::table('seller_listings')->whereIn('id', $listingIds)->delete();
            }

            DB::table('products')->whereIn('original_auth_key', $demoKeys)->delete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Demo data is intentionally not restored.
    }
};