<?php

namespace Modules\Comment\Transformers;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentCollection extends ResourceCollection
{
    public static $wrap = 'comment';

    public $collects = CommentResource::class;
}
