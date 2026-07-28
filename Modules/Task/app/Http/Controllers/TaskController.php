<?php

namespace Modules\Task\Http\Controllers;

use App\Http\Controllers\Controller;
use Exception;
use Modules\Project\Models\Project;
use Modules\Task\Http\Requests\CreateTaskRequest;
use Modules\Task\Models\Task;
use Modules\Task\Services\TaskService;
use Modules\Task\Transformers\TaskCollection;
use Modules\Task\Transformers\TaskResource;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    public function index(Project $project)
    {
        $tasks = $project->tasks()->get();

        return $this->fromResource(TaskCollection::make($tasks))
            ->addToResponse([
                'message' => 'Tasks retrieved successfully',
            ])
            ->toResponse();
    }

    public function store(CreateTaskRequest $request, Project $project)
    {
        $user = auth()->user();

        if (! $user->can('create-task', $project)) {
            throw new Exception('Unauthorized to create task for this project');
        }

        $task = $this->taskService->create($request->validated(), $project);

        return $this->fromResource(TaskResource::make($task))
            ->addToResponse([
                'message' => 'Task created successfully',
            ])
            ->toResponse();
    }

    /**
     * Show the specified resource.
     */
    public function show(Project $project, Task $task)
    {
        if ($task->project_id != $project->id) {
            throw new \Exception('Task does not belong to the specified project');
        }

        return $this->fromResource(TaskResource::make($task))
            ->addToResponse([
                'message' => 'Task retrieved successfully',
            ])
            ->toResponse();
    }
}
