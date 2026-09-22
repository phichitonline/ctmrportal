<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('hospcode')) {
            Schema::create('hospcode', function (Blueprint $table) {
                $table->char('hospcode', 5)->primary();
                $table->string('name', 255);
                $table->char('chwpart', 2)->default('66');
                $table->char('amppart', 2)->nullable();
                $table->char('tmbpart', 2)->nullable();
                $table->string('hosptype', 50)->nullable();
            });
        }

        $hospcodes = [
            ['hospcode' => '00052', 'name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร', 'chwpart' => '66', 'amppart' => '01', 'tmbpart' => '01', 'hosptype' => 'สสจ.'],
            ['hospcode' => '10726', 'name' => 'โรงพยาบาลพิจิตร', 'chwpart' => '66', 'amppart' => '01', 'tmbpart' => '01', 'hosptype' => 'รพ.ทั่วไป'],
            ['hospcode' => '11258', 'name' => 'โรงพยาบาลวังทรายพูน', 'chwpart' => '66', 'amppart' => '02', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11259', 'name' => 'โรงพยาบาลโพธิ์ประทับช้าง', 'chwpart' => '66', 'amppart' => '03', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11260', 'name' => 'โรงพยาบาลบางมูลนาก', 'chwpart' => '66', 'amppart' => '05', 'tmbpart' => '03', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11261', 'name' => 'โรงพยาบาลโพทะเล', 'chwpart' => '66', 'amppart' => '06', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11262', 'name' => 'โรงพยาบาลสามง่าม', 'chwpart' => '66', 'amppart' => '07', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11263', 'name' => 'โรงพยาบาลทับคล้อ', 'chwpart' => '66', 'amppart' => '08', 'tmbpart' => '02', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11456', 'name' => 'โรงพยาบาลสมเด็จพระยุพราชตะพานหิน', 'chwpart' => '66', 'amppart' => '04', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '11631', 'name' => 'โรงพยาบาลวชิรบารมี', 'chwpart' => '66', 'amppart' => '12', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '27978', 'name' => 'โรงพยาบาลสากเหล็ก', 'chwpart' => '66', 'amppart' => '09', 'tmbpart' => '01', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '27979', 'name' => 'โรงพยาบาลบึงนาราง', 'chwpart' => '66', 'amppart' => '10', 'tmbpart' => '05', 'hosptype' => 'รพ.ชุมชน'],
            ['hospcode' => '27980', 'name' => 'โรงพยาบาลดงเจริญ', 'chwpart' => '66', 'amppart' => '11', 'tmbpart' => '05', 'hosptype' => 'รพ.ชุมชน'],
        ];

        foreach ($hospcodes as $item) {
            DB::table('hospcode')->updateOrInsert(
                ['hospcode' => $item['hospcode']],
                $item
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospcode');
    }
};
