<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    /**
     * Display a listing of all original products
     */
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->get();
        return response()->json($products);
    }

    /**
     * Store a newly created original product (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'original_auth_key' => 'required|string|unique:products,original_auth_key',
            'official_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $imagePath = null;
        if ($request->hasFile('official_image')) {
            $image = $request->file('official_image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // Save to public/uploads/products directory
            $destinationPath = public_path('uploads/products');
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            $image->move($destinationPath, $imageName);
            $imagePath = 'uploads/products/' . $imageName;
        }

        $product = Product::create([
            'product_name' => $request->product_name,
            'brand' => $request->brand,
            'category' => $request->category,
            'description' => $request->description,
            'original_auth_key' => $request->original_auth_key,
            'official_image' => $imagePath,
        ]);

        return response()->json([
            'message' => 'Original product registered successfully.',
            'product' => $product
        ], 201);
    }

    /**
     * Display the specified original product
     */
    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    /**
     * Remove the specified original product from storage (Admin only)
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete associated image file
        if ($product->official_image) {
            $fullPath = public_path($product->official_image);
            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }
        }

        $product->delete();

        return response()->json([
            'message' => 'Original product deleted successfully.'
        ]);
    }
}
