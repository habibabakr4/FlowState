<?php

namespace Modules\Task\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Project\Models\Project;
use Modules\Task\Http\Requests\CreateTaskRequest;
use Modules\Task\Http\Requests\UpdateTaskRequest;
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
        $this->authorize('create-task', $project);

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
            abort(404, 'Task does not belong to this project');        }

        return $this->fromResource(TaskResource::make($task))
            ->addToResponse([
                'message' => 'Task retrieved successfully',
            ])
            ->toResponse();
    }

    public function update(Project $project, Task $task, UpdateTaskRequest $request)
    {
        $this->authorize('canUpdate', $project);

        if($task->project_id != $project->id){
            abort(404, 'Task does not belong to this project');        }

        $task = $this->taskService->update($task, $request->validated());

        return $this->fromResource(TaskResource::make($task))
            ->addToResponse([
                'message' => 'Task updated successfully',
            ])
            ->toResponse();

    }

    public function destroy(Project $project, Task $task)
    {
        $this->authorize('canUpdate', $project);

        if($task->project_id != $project->id){
            abort(404, 'Task does not belong to this project');        }

        $task->delete();

        return $this->addToResponse([
            'message' => 'Task deleted successfully',
        ])->toResponse();
    }
}
