<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounterfeitReport extends Model
{
    protected $fillable = [
        'user_id',
        'listing_id',
        'reason',
        'status',
        'photo_proof',
        'video_proof',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function listing()
    {
        return $this->belongsTo(SellerListing::class, 'listing_id');
    }
}
