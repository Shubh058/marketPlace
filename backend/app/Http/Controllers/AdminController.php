<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Product;
use App\Models\SellerListing;
use App\Models\VerificationLog;
use App\Models\CounterfeitReport;

class AdminController extends Controller

    /**
     * Ban a seller (set status to banned)
     */
    public function banSeller(Request $request, $id)
    {
        $seller = User::where('role', 'seller')->findOrFail($id);
        $seller->status = 'banned';
        $seller->save();
        return response()->json(['message' => 'Seller banned successfully.']);
    }

    /**
     * Remove a seller (delete account)
     */
    public function removeSeller(Request $request, $id)
    {
        $seller = User::where('role', 'seller')->findOrFail($id);
        $seller->delete();
        return response()->json(['message' => 'Seller removed successfully.']);
    }
{
    /**
     * Get aggregate statistics for the admin dashboard
     */
    public function dashboardStats()
    {
        $totalOriginalProducts = Product::count();
        $pendingListings = SellerListing::where('verification_status', 'pending')->count();
        $approvedListings = SellerListing::where('verification_status', 'approved')->count();
        $totalSellers = User::where('role', 'seller')->count();
        $totalReports = CounterfeitReport::count();
        
        $totalLogs = VerificationLog::count();
        $originalMatchLogs = VerificationLog::where('result', 'original')->count();
        $counterfeitMatchLogs = VerificationLog::where('result', 'duplicate')->count();

        return response()->json([
            'stats' => [
                'total_original_products' => $totalOriginalProducts,
                'pending_listings' => $pendingListings,
                'approved_listings' => $approvedListings,
                'total_sellers' => $totalSellers,
                'total_reports' => $totalReports,
                'total_verifications' => $totalLogs,
                'original_matches' => $originalMatchLogs,
                'counterfeit_matches' => $counterfeitMatchLogs,
            ]
        ]);
    }

    /**
     * Get profiles of all registered sellers including listing statistics and dynamically computed trust scores.
     */
    public function manageSellers()
    {
        $sellers = User::where('role', 'seller')
            ->with(['listings.counterfeitReports'])
            ->orderBy('created_at', 'desc')
            ->get();

        $sellerProfiles = $sellers->map(function ($seller) {
            $listings = $seller->listings;
            $totalListings = $listings->count();
            $approvedCount = $listings->where('verification_status', 'approved')->count();
            $rejectedCount = $listings->where('verification_status', 'rejected')->count();
            $pendingCount = $listings->where('verification_status', 'pending')->count();
            
            // Count counterfeit reports across all their listings
            $reportsCount = 0;
            foreach ($listings as $listing) {
                $reportsCount += $listing->counterfeitReports->count();
            }

            /*
             * Premium Dynamic Trust Score Algorithm:
             * - Base score is 100%
             * - Deduct 25% for each rejected listing (seller submitted invalid auth key)
             * - Deduct 35% for each counterfeit report filed against them
             * - Minimum score is 0%
             */
            $trustScore = 100;
            $trustScore -= ($rejectedCount * 25);
            $trustScore -= ($reportsCount * 35);
            
            if ($trustScore < 0) {
                $trustScore = 0;
            }

            // A seller is verified if they have >= 3 approved listings and trust score >= 80%
            $isVerifiedSeller = ($approvedCount >= 3 && $trustScore >= 80);

            return [
                'id' => $seller->id,
                'name' => $seller->name,
                'email' => $seller->email,
                'created_at' => $seller->created_at,
                'total_listings' => $totalListings,
                'approved_listings' => $approvedCount,
                'rejected_listings' => $rejectedCount,
                'pending_listings' => $pendingCount,
                'counterfeit_reports_count' => $reportsCount,
                'trust_score' => $trustScore,
                'is_verified_seller' => $isVerifiedSeller,
            ];
        });

        return response()->json($sellerProfiles);
    }

    /**
     * View all product verification logs
     */
    public function viewVerificationLogs()
    {
        $logs = VerificationLog::with(['user', 'listing.product', 'listing.seller'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
