<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SellerListingController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ReportController;

// Public Auth Endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Fallback Login Route for Unauthenticated API requests
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// Public Discovery Endpoints
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Authenticated Route group
Route::middleware('auth:sanctum')->group(function () {
    // Seller Listings (now protected)
    Route::get('/seller-listings', [SellerListingController::class, 'index']);
    
    // Global Auth Profiles
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // --- USER (CUSTOMER) ENDPOINTS ---
    Route::middleware('role.user')->group(function () {
        Route::post('/seller-listings/{id}/verify', [VerificationController::class, 'verify']);
        Route::get('/verification-history', [VerificationController::class, 'history']);
        Route::post('/counterfeit-reports', [ReportController::class, 'store']);
    });

    // --- SELLER (MERCHANT) ENDPOINTS ---
    Route::middleware('role.seller')->group(function () {
        Route::post('/seller-listings', [SellerListingController::class, 'store']);
        Route::get('/my-listings', [SellerListingController::class, 'myListings']);
        Route::delete('/my-listings/{id}', [SellerListingController::class, 'destroy']);
        Route::get('/seller/verification-logs', [VerificationController::class, 'sellerHistory']);
    });

    // --- ADMIN ENDPOINTS ---
    Route::middleware('role.admin')->group(function () {
            Route::put('/admin/sellers/{id}/ban', [AdminController::class, 'banSeller']);
            Route::delete('/admin/sellers/{id}', [AdminController::class, 'removeSeller']);
        // Admin creates and deletes master products
        Route::post('/products', [ProductController::class, 'store']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::put('/seller-listings/{id}/status', [SellerListingController::class, 'updateStatus']);
        Route::delete('/seller-listings/{id}', [SellerListingController::class, 'destroy']);
        
        // Admin Profile Dashboard and Audits
        Route::get('/admin/stats', [AdminController::class, 'dashboardStats']);
        Route::get('/admin/sellers', [AdminController::class, 'manageSellers']);
        Route::get('/admin/reports', [ReportController::class, 'index']);
        Route::put('/admin/reports/{id}/status', [ReportController::class, 'update']);
        Route::get('/admin/verification-logs', [AdminController::class, 'viewVerificationLogs']);
    });
});
