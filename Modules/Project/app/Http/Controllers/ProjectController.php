<?php

namespace Modules\Project\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Modules\Project\Http\Requests\StoreProjectRequest;
use Modules\Project\Models\Project;
use Modules\Project\Services\ProjectService;
use Modules\Project\Transformers\ProjectCollection;
use Modules\Project\Transformers\ProjectResource;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projectService) {}

    public function store(StoreProjectRequest $request)
    {
        //        validate input data
        //      get auth user id
        //        create project
        //        return project
        $validated = $request->validated();
        $user = auth()->user();

        $project = $this->projectService->create($validated, $user);

        return $this->fromResource(ProjectResource::make($project))
            ->setStatusCode(201)
            ->toResponse();
    }

    public function show(Project $project)
    {
        //        is this project belongs to the auth user?
        $user = auth()->user();

        if ($project->owner_id !== $user->id) {
            throw new AuthorizationException('Unauthorized');
        }

        return $this->fromResource(ProjectResource::make($project))
            ->setStatusCode(200)
            ->toResponse();
    }

    public function index()
    {
        $user = auth()->user();

        $projects = Project::where('owner_id', $user->id)->get();

        if ($projects->isEmpty()) {
            return $this->addToResponse(['message' => 'No projects found'])
                ->setStatusCode(404)
                ->toResponse();
        }

        return $this->fromResource(ProjectCollection::make($projects))
            ->setStatusCode(200)
            ->toResponse();
    }
}
