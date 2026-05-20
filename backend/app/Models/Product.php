<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'product_name',
        'brand',
        'category',
        'description',
        'original_auth_key',
        'official_image',
    ];

    public function listings()
    {
        return $this->hasMany(SellerListing::class);
    }
}
