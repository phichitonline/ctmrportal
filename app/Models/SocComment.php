<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'user_id',
        'content',
        'is_solution',
    ];

    protected function casts(): array
    {
        return [
            'is_solution' => 'boolean',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(SocTopic::class, 'topic_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
