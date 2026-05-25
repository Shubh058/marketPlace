<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SellerListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class SellerListingController extends Controller
{
    /**
     * Delete a seller listing.
     */
    public function destroy(Request $request, $id)
    {
        $listing = SellerListing::with('product')->findOrFail($id);
        $user = $request->user();

        if ($user && $user->role === 'seller' && $listing->seller_id !== $user->id) {
            return response()->json([
                'message' => 'You can only delete your own listings.'
            ], 403);
        }

        $product = $listing->product;
        $productId = $listing->product_id;
        $shouldDeleteProduct = $productId && !SellerListing::where('product_id', $productId)
            ->where('id', '!=', $listing->id)
            ->exists();

        DB::transaction(function () use ($listing, $product, $shouldDeleteProduct) {
            foreach ([$listing->invoice_file, $listing->listing_image] as $filePath) {
                if ($filePath) {
                    $fullPath = public_path($filePath);
                    if (File::exists($fullPath)) {
                        File::delete($fullPath);
                    }
                }
            }

            $listing->delete();

            if ($shouldDeleteProduct && $product) {
                if ($product->official_image) {
                    $fullPath = public_path($product->official_image);
                    if (File::exists($fullPath)) {
                        File::delete($fullPath);
                    }
                }

                $product->delete();
            }
        });

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
            $listings = $query->orderByRaw("FIELD(verification_status, 'pending', 'approved', 'rejected')")
                ->orderBy('created_at', 'desc')
                ->get();
        } else if ($user && $user->role === 'seller') {
            $listings = $query->where('seller_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $listings = $query->where('verification_status', 'approved')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($listings);
    }

    /**
     * Create a new seller listing
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'seller_auth_key' => 'required|string|max:255',
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
            'product_id' => null,
            'product_name' => $request->product_name,
            'brand' => $request->brand,
            'category' => $request->category,
            'description' => $request->description,
            'seller_auth_key' => strtoupper(trim($request->seller_auth_key)),
            'invoice_file' => $invoicePath,
            'listing_image' => $imagePath,
            'verification_status' => 'pending',
            'price' => $request->price,
        ]);

        return response()->json([
            'message' => 'Product submission created successfully and sent to admin for approval.',
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

        DB::transaction(function () use ($listing, $request) {
            if ($request->status === 'approved' && $listing->product_id === null) {
                $product = Product::updateOrCreate(
                    ['original_auth_key' => $listing->seller_auth_key],
                    [
                        'product_name' => $listing->product_name,
                        'brand' => $listing->brand,
                        'category' => $listing->category,
                        'description' => $listing->description,
                        'official_image' => null,
                    ]
                );

                $listing->product_id = $product->id;
            }

            $listing->verification_status = $request->status;
            $listing->save();
        });

        return response()->json([
            'message' => 'Listing status updated to: ' . $request->status,
            'listing' => $listing->load(['seller', 'product'])
        ]);
    }
}