<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StepAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'step_id',
        'task_id',
        'user_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
        'description',
        'download_count',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'download_count' => 'integer',
        ];
    }

    /**
     * Parent step.
     */
    public function step(): BelongsTo
    {
        return $this->belongsTo(AgencyTaskStep::class, 'step_id');
    }

    /**
     * Parent task.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(AgencyTask::class, 'task_id');
    }

    /**
     * Uploader user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Helper to get human readable file size.
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }

    /**
     * Map file extension or mime type to canonical category.
     */
    public static function detectFileType(string $extension, ?string $mimeType = null): string
    {
        $ext = strtolower($extension);

        if ($ext === 'pdf') {
            return 'pdf';
        }

        if (in_array($ext, ['doc', 'docx', 'rtf', 'odt'])) {
            return 'word';
        }

        if (in_array($ext, ['xls', 'xlsx', 'csv', 'ods'])) {
            return 'excel';
        }

        if (in_array($ext, ['ppt', 'pptx', 'odp'])) {
            return 'powerpoint';
        }

        return 'other';
    }
}
