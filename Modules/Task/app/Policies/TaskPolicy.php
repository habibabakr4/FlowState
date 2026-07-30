<?php

namespace Modules\Task\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Modules\Project\Models\Project;
use Modules\User\Models\User;

class TaskPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     */
    public function __construct() {}

    public function createTask(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    public function canUpdate(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }
}
