<?php

namespace Modules\Project\Tests\Unit;

use Illuminate\Http\Request;
use Modules\Project\Models\Project;
use Modules\Project\Transformers\ProjectResource;
use Tests\TestCase;

class ProjectResourceTest extends TestCase
{
    public function test_project_resource_includes_the_project_id(): void
    {
        $project = new Project;
        $project->id = 42;

        $this->assertSame(42, ProjectResource::make($project)->toArray(new Request)['id']);
    }
}
