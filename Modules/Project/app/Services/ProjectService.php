<?php

namespace Modules\Project\Services;

use Modules\Project\Models\Project;

class ProjectService
{
    public function create(array $validated, $user) : Project
    {
        $project = Project::create([
            ...$validated,
            'status' => 'active',
            'owner_id' => $user->id,
        ]);
        return $project;
    }
}
