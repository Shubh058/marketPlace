<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerListing extends Model
{
    protected $fillable = [
        'seller_id',
        'product_id',
        'product_name',
        'brand',
        'category',
        'description',
        'seller_auth_key',
        'invoice_file',
        'listing_image',
        'verification_status',
        'price',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function verificationLogs()
    {
        return $this->hasMany(VerificationLog::class, 'listing_id');
    }

    public function counterfeitReports()
    {
        return $this->hasMany(CounterfeitReport::class, 'listing_id');
    }
}
