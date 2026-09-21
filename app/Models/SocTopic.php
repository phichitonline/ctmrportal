<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'category',
        'severity',
        'status',
        'agency_code',
        'agency_name',
        'shift',
        'shift_date',
        'system_affected',
        'image_path',
        'images',
        'content',
        'resolution_notes',
        'is_pinned',
        'is_locked',
        'views_count',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'shift_date' => 'date',
            'is_pinned' => 'boolean',
            'is_locked' => 'boolean',
            'views_count' => 'integer',
            'resolved_at' => 'datetime',
            'images' => 'array',
        ];
    }

    /**
     * Category labels in Thai.
     */
    public static array $categoryLabels = [
        'soc_report' => 'รายงานเวรศูนย์ SOC',
        'discussion' => 'แลกเปลี่ยนประเด็นดูแลระบบ',
        'incident_alert' => 'แจ้งเตือนภัยคุกคาม / Incident',
        'troubleshoot' => 'บันทึกการแก้ปัญหา (KB)',
        'announcement' => 'ประกาศ & ข่าวสาร',
    ];

    /**
     * Severity labels in Thai.
     */
    public static array $severityLabels = [
        'info' => 'ข้อมูลทั่วไป (Info)',
        'normal' => 'ปกติ (Normal)',
        'low' => 'ต่ำ (Low)',
        'medium' => 'ปานกลาง (Medium)',
        'high' => 'สูง (High)',
        'critical' => 'วิกฤต (Critical)',
    ];

    /**
     * Status labels in Thai.
     */
    public static array $statusLabels = [
        'open' => 'เปิดประเด็น (Open)',
        'in_progress' => 'กำลังดำเนินการ (In Progress)',
        'resolved' => 'แก้ไขเรียบร้อย (Resolved)',
        'closed' => 'ปิดประเด็น (Closed)',
    ];

    /**
     * Shifts in Thai.
     */
    public static array $shiftLabels = [
        'morning' => 'เวรเช้า (08:00 - 16:00)',
        'afternoon' => 'เวรบ่าย (16:00 - 24:00)',
        'night' => 'เวรดึก (00:00 - 08:00)',
        'daily' => 'เวรประจำวัน (24 ชม.)',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resolvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(SocComment::class, 'topic_id')->orderBy('created_at', 'asc');
    }
}
