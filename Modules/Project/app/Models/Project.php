<?php

namespace Modules\Project\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\User\Models\User;

// use Modules\Project\Database\Factories\ProjectFactory;

class Project extends Model
{
    protected $table = 'project';

    protected $fillable = ['name', 'description', 'status', 'owner_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id', 'id');
    }
    // protected static function newFactory(): ProjectFactory
    // {
    //     // return ProjectFactory::new();
    // }
}
