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
        Schema::create('soc_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('category')->default('discussion'); // soc_report, discussion, incident_alert, troubleshoot, announcement
            $table->string('severity')->default('normal');     // info, normal, low, medium, high, critical
            $table->string('status')->default('open');         // open, in_progress, resolved, closed
            $table->string('agency_code')->nullable();
            $table->string('agency_name')->nullable();
            $table->string('shift')->nullable();               // morning, afternoon, night, daily
            $table->date('shift_date')->nullable();
            $table->string('system_affected')->nullable();
            $table->longText('content');
            $table->text('resolution_notes')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            // Indexes for fast filtering & sorting
            $table->index('category');
            $table->index('severity');
            $table->index('status');
            $table->index('agency_code');
            $table->index('is_pinned');
            $table->index('created_at');
        });

        Schema::create('soc_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('soc_topics')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->longText('content');
            $table->boolean('is_solution')->default(false);
            $table->timestamps();

            $table->index(['topic_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soc_comments');
        Schema::dropIfExists('soc_topics');
    }
};
