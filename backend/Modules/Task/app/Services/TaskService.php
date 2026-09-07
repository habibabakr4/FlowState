<?php

namespace Modules\Task\Services;

use Modules\Project\Models\Project;
use Modules\Task\Models\Task;
use Modules\User\Models\User;

class TaskService
{
    public function create(array $data, Project $project, User $user): Task
    {

        $task = $project->tasks()->create([
            'title' => $data['title'],
            'description' => $data['description'],
            'due_date' => $data['due_date'],
            'priority' => $data['priority'] ?? null,
            'status' => 'todo',
            'created_by' => $user->id,
        ]);

        if (! empty($data['assigned_to'])) {
            $task->assignedUsers()->sync($data['assigned_to']);
        }

        return $task;
    }

    public function update(Task $task, array $data): Task
    {
        $task->update($data);

        if (isset($data['assigned_to'])) {
            $task->assignedUsers()->sync($data['assigned_to']);
        }

        return $task;
    }
}
