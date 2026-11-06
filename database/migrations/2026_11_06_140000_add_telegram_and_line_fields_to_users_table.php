<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'telegram_chat_id')) {
                $table->string('telegram_chat_id', 100)->nullable()->index()->after('phone');
            }
            if (! Schema::hasColumn('users', 'telegram_username')) {
                $table->string('telegram_username', 100)->nullable()->after('telegram_chat_id');
            }
            if (! Schema::hasColumn('users', 'telegram_linked_at')) {
                $table->timestamp('telegram_linked_at')->nullable()->after('telegram_username');
            }
            if (! Schema::hasColumn('users', 'line_user_id')) {
                $table->string('line_user_id', 100)->nullable()->index()->after('telegram_linked_at');
            }
            if (! Schema::hasColumn('users', 'line_display_name')) {
                $table->string('line_display_name', 150)->nullable()->after('line_user_id');
            }
            if (! Schema::hasColumn('users', 'line_linked_at')) {
                $table->timestamp('line_linked_at')->nullable()->after('line_display_name');
            }
            if (! Schema::hasColumn('users', 'notification_link_token')) {
                $table->string('notification_link_token', 32)->nullable()->unique()->after('line_linked_at');
            }
            if (! Schema::hasColumn('users', 'notification_preferences')) {
                $table->json('notification_preferences')->nullable()->after('notification_link_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'telegram_chat_id',
                'telegram_username',
                'telegram_linked_at',
                'line_user_id',
                'line_display_name',
                'line_linked_at',
                'notification_link_token',
                'notification_preferences',
            ];

            foreach ($columns as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

