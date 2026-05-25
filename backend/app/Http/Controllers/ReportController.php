<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\CounterfeitReport;
use App\Models\SellerListing;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class ReportController extends Controller
{
    /**
     * Display a listing of all counterfeit reports (Admin only)
     */
    public function index()
    {
        $reports = CounterfeitReport::with(['user', 'listing.product', 'listing.seller'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'resolved' THEN 2 ELSE 3 END")
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
            'reason' => 'required|string|min:10',
            'photo_proof' => 'required_without:video_proof|nullable|file|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'video_proof' => 'required_without:photo_proof|nullable|file|mimes:mp4,avi,mov,webm|max:20480',
        ], [
            'photo_proof.required_without' => 'Please upload at least one proof file: a product photo or a video.',
            'video_proof.required_without' => 'Please upload at least one proof file: a product photo or a video.',
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

        $photoPath = null;
        if ($request->hasFile('photo_proof')) {
            $file = $request->file('photo_proof');
            $fileName = time() . '_photo_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destination = public_path('uploads/reports/photos');
            if (!File::exists($destination)) {
                File::makeDirectory($destination, 0755, true);
            }
            $file->move($destination, $fileName);
            $photoPath = 'uploads/reports/photos/' . $fileName;
        }

        $videoPath = null;
        if ($request->hasFile('video_proof')) {
            $file = $request->file('video_proof');
            $fileName = time() . '_video_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destination = public_path('uploads/reports/videos');
            if (!File::exists($destination)) {
                File::makeDirectory($destination, 0755, true);
            }
            $file->move($destination, $fileName);
            $videoPath = 'uploads/reports/videos/' . $fileName;
        }

        $report = CounterfeitReport::create([
            'user_id' => $userId,
            'listing_id' => $request->listing_id,
            'reason' => $request->reason,
            'status' => 'pending',
            'photo_proof' => $photoPath,
            'video_proof' => $videoPath,
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
