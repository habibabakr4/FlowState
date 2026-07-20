<?php

namespace Modules\Task\Transformers;

use Illuminate\Http\Resources\Json\ResourceCollection;

class TaskCollection extends ResourceCollection
{
    public static $wrap = 'task';

    public $collects = TaskResource::class;
}
