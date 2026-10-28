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
        if (! Schema::hasTable('soc_shift_schedules')) {
            Schema::create('soc_shift_schedules', function (Blueprint $table) {
                $table->id();
                $table->date('shift_date')->index();
                $table->string('shift_type', 30)->default('daily')->index(); // morning, afternoon, night, daily
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('backup_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('agency_code', 20)->nullable();
                $table->string('agency_name', 255)->nullable();
                $table->string('role_in_shift', 50)->default('operator'); // operator, supervisor
                $table->string('status', 30)->default('scheduled')->index(); // scheduled, checked_in, completed, missed
                $table->foreignId('soc_topic_id')->nullable()->constrained('soc_topics')->nullOnDelete();
                $table->timestamp('checked_in_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->text('handover_notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soc_shift_schedules');
    }
};

