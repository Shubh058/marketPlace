<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\SellerListing;
use App\Models\VerificationLog;
use App\Models\CounterfeitReport;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users (Admin, Sellers, Customer)
        $admin = User::create([
            'name' => 'Marketplace Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $seller1 = User::create([
            'name' => 'Apex Electronics (Verified Seller)',
            'email' => 'seller1@example.com',
            'password' => Hash::make('password123'),
            'role' => 'seller',
        ]);

        $seller2 = User::create([
            'name' => 'ShadyDeals Retailer',
            'email' => 'seller2@example.com',
            'password' => Hash::make('password123'),
            'role' => 'seller',
        ]);

        $customer = User::create([
            'name' => 'Jane Customer',
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        // 2. Seed Original Products (Admin-created)
        $iphone = Product::create([
            'product_name' => 'iPhone 15 Pro Max (Titanium, 256GB)',
            'brand' => 'Apple',
            'description' => 'The official titanium smartphone by Apple. Features A17 Pro chip, action button, and advanced 48MP camera system.',
            'original_auth_key' => 'APPLE-IP15PM-XYZ890',
            'official_image' => null,
        ]);

        $nikeShoes = Product::create([
            'product_name' => 'Air Max 90 Classic Sneakers',
            'brand' => 'Nike',
            'description' => 'Classic running sneakers by Nike featuring iconic waffle outsole, stitched overlays, and classic TPU accents.',
            'original_auth_key' => 'NIKE-AM90-CLASSIC123',
            'official_image' => null,
        ]);

        $headphones = Product::create([
            'product_name' => 'WH-1000XM5 Wireless Headphones',
            'brand' => 'Sony',
            'description' => 'Industry-leading noise-canceling headphones with dual processors, eight microphones, and exceptional call quality.',
            'original_auth_key' => 'SONY-XM5-NOISECANCEL456',
            'official_image' => null,
        ]);

        // 3. Seed Seller Listings
        // Listing 1: Apex Electronics lists iPhone with valid auth key -> Approved
        $listing1 = SellerListing::create([
            'seller_id' => $seller1->id,
            'product_id' => $iphone->id,
            'seller_auth_key' => 'APPLE-IP15PM-XYZ890',
            'invoice_file' => 'uploads/invoices/apex_iphone_invoice.pdf',
            'listing_image' => null,
            'verification_status' => 'approved',
            'price' => 1199.99
        ]);

        // Listing 2: ShadyDeals lists iPhone with INVALID auth key -> Rejected
        $listing2 = SellerListing::create([
            'seller_id' => $seller2->id,
            'product_id' => $iphone->id,
            'seller_auth_key' => 'APPLE-IP15PM-FAKEKEY-999',
            'invoice_file' => 'uploads/invoices/shady_invoice.pdf',
            'listing_image' => null,
            'verification_status' => 'rejected',
            'price' => 899.99
        ]);

        // Listing 3: Apex Electronics lists Nike Shoes with valid auth key -> Approved
        $listing3 = SellerListing::create([
            'seller_id' => $seller1->id,
            'product_id' => $nikeShoes->id,
            'seller_auth_key' => 'NIKE-AM90-CLASSIC123',
            'invoice_file' => 'uploads/invoices/apex_nike_invoice.pdf',
            'listing_image' => null,
            'verification_status' => 'approved',
            'price' => 149.99
        ]);

        // Listing 4: ShadyDeals lists Sony Headphones with valid auth key -> Pending
        $listing4 = SellerListing::create([
            'seller_id' => $seller2->id,
            'product_id' => $headphones->id,
            'seller_auth_key' => 'SONY-XM5-NOISECANCEL456',
            'invoice_file' => 'uploads/invoices/shady_headphones_invoice.pdf',
            'listing_image' => null,
            'verification_status' => 'pending',
            'price' => 329.99
        ]);

        // 4. Seed Verification Logs
        // Customer verified Apex iPhone using matching key -> Original
        VerificationLog::create([
            'user_id' => $customer->id,
            'listing_id' => $listing1->id,
            'entered_key' => 'APPLE-IP15PM-XYZ890',
            'result' => 'original'
        ]);

        // Customer verified ShadyDeals iPhone using fake key -> Duplicate
        VerificationLog::create([
            'user_id' => $customer->id,
            'listing_id' => $listing2->id,
            'entered_key' => 'APPLE-IP15PM-FAKEKEY-999',
            'result' => 'duplicate'
        ]);

        // 5. Seed Counterfeit Reports
        // Customer reported ShadyDeals for selling fake iPhone
        CounterfeitReport::create([
            'user_id' => $customer->id,
            'listing_id' => $listing2->id,
            'reason' => 'The price is suspiciously low and they failed the key verification test. This is an obvious duplicate clone.',
            'status' => 'pending'
        ]);
    }
}
