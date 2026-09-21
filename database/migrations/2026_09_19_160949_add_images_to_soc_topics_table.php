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
        Schema::table('soc_topics', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('system_affected');
            $table->json('images')->nullable()->after('image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('soc_topics', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'images']);
        });
    }
};
