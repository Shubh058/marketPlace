<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SellerListing;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class SellerListingController extends Controller
{
    /**
     * Delete a seller listing (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        $listing = SellerListing::findOrFail($id);
        $listing->delete();
        return response()->json([
            'message' => 'Listing deleted successfully.'
        ]);
    }

    /**
     * Get a list of seller listings based on user role
     */
    public function index(Request $request)
    {
        $query = SellerListing::with(['seller', 'product']);

        $user = $request->user();

        if ($user && $user->role === 'admin') {
            // Admins see all listings (pending first)
            $listings = $query->orderByRaw("CASE WHEN verification_status = 'pending' THEN 1 WHEN verification_status = 'approved' THEN 2 WHEN verification_status = 'rejected' THEN 3 ELSE 4 END")
                              ->orderBy('created_at', 'desc')->get();
        } else if ($user && $user->role === 'seller') {
            // Sellers see their own listings
            $listings = $query->where('seller_id', $user->id)
                              ->orderBy('created_at', 'desc')->get();
        } else {
            // Customers/Public see only approved listings
            $listings = $query->where('verification_status', 'approved')
                              ->orderBy('created_at', 'desc')->get();
        }

        return response()->json($listings);
    }

    /**
     * Create a new seller listing
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'seller_auth_key' => 'required|string',
            'price' => 'required|numeric|min:0.01',
            'invoice_file' => 'required|file|mimes:pdf,jpeg,png,jpg|max:2048',
            'listing_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $sellerId = $request->user()->id;

        // Save invoice file
        $invoicePath = null;
        if ($request->hasFile('invoice_file')) {
            $file = $request->file('invoice_file');
            $fileName = time() . '_inv_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destination = public_path('uploads/invoices');
            if (!File::exists($destination)) {
                File::makeDirectory($destination, 0755, true);
            }
            $file->move($destination, $fileName);
            $invoicePath = 'uploads/invoices/' . $fileName;
        }

        // Save listing product image
        $imagePath = null;
        if ($request->hasFile('listing_image')) {
            $image = $request->file('listing_image');
            $imageName = time() . '_list_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $destination = public_path('uploads/listings');
            if (!File::exists($destination)) {
                File::makeDirectory($destination, 0755, true);
            }
            $image->move($destination, $imageName);
            $imagePath = 'uploads/listings/' . $imageName;
        }

        $listing = SellerListing::create([
            'seller_id' => $sellerId,
            'product_id' => $request->product_id,
            'seller_auth_key' => $request->seller_auth_key,
            'invoice_file' => $invoicePath,
            'listing_image' => $imagePath,
            'verification_status' => 'pending', // Always pending initially
            'price' => $request->price,
        ]);

        return response()->json([
            'message' => 'Product listing created successfully and sent to admin for verification review.',
            'listing' => $listing->load('product')
        ], 201);
    }

    /**
     * Get listings for currently logged-in seller
     */
    public function myListings(Request $request)
    {
        $listings = SellerListing::with('product')
            ->where('seller_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($listings);
    }

    /**
     * Update listing verification status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:approved,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $listing = SellerListing::findOrFail($id);
        $listing->verification_status = $request->status;
        $listing->save();

        return response()->json([
            'message' => 'Listing status updated to: ' . $request->status,
            'listing' => $listing->load(['seller', 'product'])
        ]);
    }
}
