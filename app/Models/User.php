<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'provider_id',
        'thaid_id',
        'pid',
        'moph_id',
        'email',
        'avatar',
        'password',
        'role',
        'agency_code',
        'agency_name',
        'position',
        'phone',
        'telegram_chat_id',
        'telegram_username',
        'telegram_linked_at',
        'line_user_id',
        'line_display_name',
        'line_linked_at',
        'notification_link_token',
        'notification_preferences',
        'department_id',
        'hospcode',
        'hname_th',
        'is_active',
        'last_login_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
            'telegram_linked_at' => 'datetime',
            'line_linked_at' => 'datetime',
            'notification_preferences' => 'array',
        ];
    }

    public static function defaultNotificationPreferences(): array
    {
        return [
            'notify_shift_assigned' => true,
            'notify_shift_reminder' => true,
            'notify_soc_report' => true,
            'notify_incident_alert' => true,
            'telegram_enabled' => true,
            'line_enabled' => true,
        ];
    }

    public function getNotificationPrefs(): array
    {
        return array_merge(
            self::defaultNotificationPreferences(),
            is_array($this->notification_preferences) ? $this->notification_preferences : []
        );
    }

    public function wantsNotification(string $key): bool
    {
        $prefs = $this->getNotificationPrefs();

        return (bool) ($prefs[$key] ?? true);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasEnabledTwoFactor(): bool
    {
        return ! is_null($this->two_factor_confirmed_at);
    }

    /**
     * Replace or consume a recovery code.
     */
    public function consumeRecoveryCode(string $code): bool
    {
        $codes = $this->two_factor_recovery_codes ?? [];
        $code = trim($code);

        foreach ($codes as $index => $storedCode) {
            if (hash_equals($storedCode, $code)) {
                unset($codes[$index]);
                $this->forceFill([
                    'two_factor_recovery_codes' => array_values($codes),
                ])->save();

                return true;
            }
        }

        return false;
    }

    /**
     * Reset 2FA configuration completely.
     */
    public function resetTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function socTopics(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SocTopic::class);
    }

    public function socComments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SocComment::class);
    }
}
