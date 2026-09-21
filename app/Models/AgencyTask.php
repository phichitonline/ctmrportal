<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgencyTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'agency_code',
        'agency_name',
        'user_id',
        'assigned_user_id',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'progress_percent',
        'start_date',
        'due_date',
        'completed_at',
        'is_pinned',
    ];

    protected function casts(): array
    {
        return [
            'progress_percent' => 'integer',
            'is_pinned' => 'boolean',
            'start_date' => 'date',
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * User who created this task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Assigned staff.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Step timeline records.
     */
    public function steps(): HasMany
    {
        return $this->hasMany(AgencyTaskStep::class, 'task_id')->orderBy('step_number', 'asc');
    }

    /**
     * All attachments across all steps in this task.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(StepAttachment::class, 'task_id')->latest();
    }

    /**
     * Recalculate progress percentage based on completed steps.
     */
    public function recalculateProgress(): void
    {
        $total = $this->steps()->count();
        if ($total === 0) {
            return;
        }

        $completed = $this->steps()->where('status', 'completed')->count();
        $this->progress_percent = (int) round(($completed / $total) * 100);

        if ($this->progress_percent === 100 && $this->status !== 'completed') {
            $this->status = 'completed';
            $this->completed_at = now();
        } elseif ($this->progress_percent > 0 && $this->status === 'pending') {
            $this->status = 'in_progress';
        }

        $this->save();
    }
}
