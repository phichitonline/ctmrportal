<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocShiftSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_date',
        'shift_type',
        'user_id',
        'backup_user_id',
        'agency_code',
        'agency_name',
        'role_in_shift',
        'status',
        'soc_topic_id',
        'checked_in_at',
        'completed_at',
        'handover_notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'shift_date' => 'date',
            'checked_in_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public static array $shiftTypeLabels = [
        'morning' => 'เวรเช้า (08:00 - 16:00)',
        'afternoon' => 'เวรบ่าย (16:00 - 24:00)',
        'night' => 'เวรดึก (00:00 - 08:00)',
        'daily' => 'เวรประจำวัน (24 ชม.)',
    ];

    public static array $statusLabels = [
        'scheduled' => 'รอเข้าเวร (Scheduled)',
        'checked_in' => 'กำลังปฏิบัติหน้าที่ (On-Duty)',
        'completed' => 'ส่งรายงานผลแล้ว (Completed)',
        'missed' => 'ขาดการส่งรายงาน (Missed)',
    ];

    public static array $roleLabels = [
        'operator' => 'เจ้าหน้าที่เฝ้าระวัง (SOC Operator)',
        'supervisor' => 'หัวหน้าเวรควบคุม (Shift Supervisor)',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function backupUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'backup_user_id');
    }

    public function socTopic(): BelongsTo
    {
        return $this->belongsTo(SocTopic::class, 'soc_topic_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

