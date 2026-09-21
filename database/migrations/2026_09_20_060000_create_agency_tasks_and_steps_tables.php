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
        // 1. Agency Tasks / Projects
        Schema::create('agency_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('agency_code', 10)->index();
            $table->string('agency_name');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category', 50)->default('general'); // cybersecurity, his_system, monthly_report, audit, general
            $table->string('priority', 20)->default('normal'); // urgent, high, normal, low
            $table->string('status', 30)->default('pending'); // pending, in_progress, under_review, completed, cancelled
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
        });

        // 2. Task Steps Timeline
        Schema::create('agency_task_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('agency_tasks')->onDelete('cascade');
            $table->unsignedInteger('step_number')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 30)->default('pending'); // pending, in_progress, completed
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // 3. Step Attachments (PDF, Word, Excel, PowerPoint)
        Schema::create('step_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('step_id')->constrained('agency_task_steps')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('agency_tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path', 500);
            $table->string('file_type', 20)->default('other'); // pdf, word, excel, powerpoint, other
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('mime_type', 150)->nullable();
            $table->string('description')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('step_attachments');
        Schema::dropIfExists('agency_task_steps');
        Schema::dropIfExists('agency_tasks');
    }
};
