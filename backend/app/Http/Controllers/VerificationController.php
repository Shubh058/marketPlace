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

        // Match entered key with the admin's original auth key
        $isOriginal = ($request->entered_key === $product->original_auth_key);
        
        // Also verify that the seller's listed auth key matches the original auth key
        $isSellerKeyValid = ($listing->seller_auth_key === $product->original_auth_key);

        // Ultimate verdict: The product is original ONLY if the entered key is correct AND the seller's key matches the original admin key
        $finalVerdict = ($isOriginal && $isSellerKeyValid) ? 'original' : 'duplicate';

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
}
