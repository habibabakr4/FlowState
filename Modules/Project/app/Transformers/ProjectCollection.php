<?php

namespace Modules\Project\Transformers;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ProjectCollection extends ResourceCollection
{
    public static $wrap = 'project';

    public $collects = ProjectResource::class;
}
