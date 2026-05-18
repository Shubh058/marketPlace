<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\CounterfeitReport;
use App\Models\SellerListing;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * Display a listing of all counterfeit reports (Admin only)
     */
    public function index()
    {
        $reports = CounterfeitReport::with(['user', 'listing.product', 'listing.seller'])
            ->orderByRaw("FIELD(status, 'pending', 'resolved')")
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reports);
    }

    /**
     * File a new counterfeit report (User only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'listing_id' => 'required|exists:seller_listings,id',
            'reason' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = $request->user()->id;

        // Check if user already reported this listing
        $existing = CounterfeitReport::where('user_id', $userId)
                                     ->where('listing_id', $request->listing_id)
                                     ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already reported this product listing to the administrator.'
            ], 409);
        }

        $report = CounterfeitReport::create([
            'user_id' => $userId,
            'listing_id' => $request->listing_id,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Thank you. Counterfeit complaint submitted successfully and is being reviewed by the Admin team.',
            'report' => $report->load(['listing.product', 'listing.seller'])
        ], 201);
    }

    /**
     * Resolve a counterfeit report status (Admin only)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,resolved'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $report = CounterfeitReport::findOrFail($id);
        $report->status = $request->status;
        $report->save();

        return response()->json([
            'message' => 'Counterfeit report status updated successfully.',
            'report' => $report->load(['user', 'listing.product', 'listing.seller'])
        ]);
    }
}
