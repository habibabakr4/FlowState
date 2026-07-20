<?php

namespace Modules\Task\Services;

use Exception;
use Modules\Project\Models\Project;
use Modules\Task\Models\Task;

class TaskService
{
    public function create(array $data, Project $project): Task
    {
        $user = auth()->user();

        if (! $project) {
            throw new Exception('Project not found');
        }

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
}
