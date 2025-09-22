<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'action',
        'description',
        'subject_id',
        'subject_type',
    ];

    /**
     * The user who performed the action.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The company associated with the activity.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * The related model (Product, Warehouse, Admin, etc.).
     */
    public function subject()
    {
        return $this->morphTo();
    }

    /**
     * Helper to log activity easily.
     */
    public static function record($userId, $action, $description, $subject = null, $companyId = null)
    {
        return self::create([
            'user_id'      => $userId,
            'company_id'   => $companyId,
            'action'       => $action,
            'description'  => $description,
            'subject_id'   => $subject?->id,
            'subject_type' => $subject ? get_class($subject) : null,
        ]);
    }
}
