<?php

namespace Database\Seeders;

use App\Models\User;
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
        // 1. Seed Users (Admin, Seller, and Customer)
        $admin = User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Marketplace Admin',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $seller = User::updateOrCreate([
            'email' => 'seller1@example.com',
        ], [
            'name' => 'Verified Seller',
            'password' => Hash::make('password123'),
            'role' => 'seller',
        ]);

        $customer = User::updateOrCreate([
            'email' => 'user@example.com',
        ], [
            'name' => 'Jane Customer',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
    }
}
