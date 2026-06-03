<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SellerListing;
use App\Models\VerificationLog;
use Illuminate\Support\Facades\Validator;

class VerificationController extends Controller
{
    /**
     * Verify a product listing by matching the entered key with the admin original key
     */
    public function verify(Request $request, $listingId)
    {
        $validator = Validator::make($request->all(), [
            'entered_key' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $listing = SellerListing::with(['product', 'seller'])->findOrFail($listingId);
        $product = $listing->product;

        if (!$product) {
            return response()->json([
                'message' => 'Product record not found for this listing.'
            ], 404);
        }

        $enteredKey = strtoupper(trim($request->entered_key));
        $storedKey = strtoupper(trim($product->original_auth_key ?? ''));

        // The product is original only when the printed key matches the master database key.
        $finalVerdict = hash_equals($storedKey, $enteredKey) ? 'original' : 'duplicate';

        // Log the verification attempt
        $log = VerificationLog::create([
            'user_id' => $request->user()->id,
            'listing_id' => $listingId,
            'entered_key' => $request->entered_key,
            'result' => $finalVerdict
        ]);

        return response()->json([
            'message' => $finalVerdict === 'original' ? '✅ ORIGINAL PRODUCT MATCHED' : '❌ DUPLICATE / COUNTERFEIT PRODUCT DETECTED',
            'verified' => ($finalVerdict === 'original'),
            'log' => $log->load(['listing.product', 'listing.seller'])
        ]);
    }

    /**
     * Get the verification log history for the current user
     */
    public function history(Request $request)
    {
        $logs = VerificationLog::with(['listing.product', 'listing.seller'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }

    /**
     * Get verification logs for the authenticated seller's listings.
     */
    public function sellerHistory(Request $request)
    {
        $sellerId = $request->user()->id;

        $logs = VerificationLog::with(['user', 'listing.product', 'listing.seller'])
            ->whereHas('listing', function ($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
