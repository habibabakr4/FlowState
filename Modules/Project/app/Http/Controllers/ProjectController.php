<?php

namespace Modules\Project\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Modules\Project\Http\Requests\StoreProjectRequest;
use Modules\Project\Models\Project;
use Modules\Project\Services\ProjectService;
use Modules\Project\Transformers\ProjectResource;
use Modules\Project\Transformers\ProjectCollection;

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
        $user = Auth::guard('sanctum')->user();

        $project = $this->projectService->create($validated, $user);

        return $this->fromResource(ProjectResource::make($project))
            ->setStatusCode(201)
            ->toResponse();
    }

    public function show(Project $project)
    {
//        is this project belongs to the auth user?
        $user = Auth::guard('sanctum')->user();

        if ($project->owner_id !== $user->id) {
            throw new \Exception('Unauthorized');
        }
        $this->fromResource(ProjectResource::make($project))
            ->setStatusCode(200)
            ->toResponse();
    }

    public function index()
    {
        $user = Auth::guard('sanctum')->user();

        $projects = Project::where('owner_id', $user->id)->get();


        return $this->fromResource(ProjectCollection::make($projects))
            ->setStatusCode(200)
            ->toResponse();
    }
    
}
