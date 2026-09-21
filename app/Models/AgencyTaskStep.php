<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgencyTaskStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'step_number',
        'title',
        'description',
        'status',
        'due_date',
        'completed_at',
        'completed_by',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'step_number' => 'integer',
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Parent task project.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(AgencyTask::class, 'task_id');
    }

    /**
     * User who marked this step as completed.
     */
    public function completedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Attachments uploaded for this specific step.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(StepAttachment::class, 'step_id')->latest();
    }
}
