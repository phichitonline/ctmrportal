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
            if (!Schema::hasColumn('users', 'thaid_id')) {
                $table->string('thaid_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('users', 'pid')) {
                $table->string('pid')->nullable()->after('thaid_id');
            }
            if (!Schema::hasColumn('users', 'moph_id')) {
                $table->string('moph_id')->nullable()->after('pid');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'department_id')) {
                $table->unsignedBigInteger('department_id')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('users', 'hospcode')) {
                $table->string('hospcode')->nullable()->after('department_id');
            }
            if (!Schema::hasColumn('users', 'hname_th')) {
                $table->string('hname_th')->nullable()->after('hospcode');
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
                'thaid_id',
                'pid',
                'moph_id',
                'avatar',
                'department_id',
                'hospcode',
                'hname_th'
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
