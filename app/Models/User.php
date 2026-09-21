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
        'email',
        'password',
        'role',
        'agency_code',
        'agency_name',
        'position',
        'phone',
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
        ];
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
