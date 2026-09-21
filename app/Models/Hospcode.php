<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hospcode extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hospcode';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'hospcode';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'amppart',
        'chwpart',
        'hospcode',
        'hosptype',
        'name',
        'tmbpart',
        'moopart',
        'sss_code',
        'sss_code_sub',
        'hospcode506',
        'hospital_type_id',
        'bed_count',
        'po_code',
        'hospital_level_id',
        'hospital_phone',
        'hospital_fax',
        'hos_guid',
        'hos_guid_ext',
        'addrpart',
        'area_code',
        'province_name',
        'zone',
        'region_id',
        'hospcode_5_digit',
        'hospcode_9_digit',
        'active_status',
    ];
}
