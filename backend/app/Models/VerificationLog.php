<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationLog extends Model
{
    protected $fillable = [
        'user_id',
        'listing_id',
        'entered_key',
        'result',
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
