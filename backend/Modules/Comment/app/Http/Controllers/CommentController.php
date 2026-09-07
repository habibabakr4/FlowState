<?php

namespace Modules\Comment\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Comment\Http\Requests\CreateCommentRequest;
use Modules\Comment\Models\Comment;
use Modules\Comment\Services\CommentService;
use Modules\Comment\Transformers\CommentCollection;
use Modules\Comment\Transformers\CommentResource;
use Modules\Project\Models\Project;
use Modules\Task\Models\Task;

class CommentController extends Controller
{
    public function __construct(private readonly CommentService $commentService) {}

    public function index(Project $project, Task $task)
    {
        $user = auth()->user();

        $comments = $this->commentService->get($user, $task);

        return $this->fromResource(CommentCollection::make($comments))
            ->toResponse();
    }

    public function store(CreateCommentRequest $request, Project $project, Task $task)
    {

        $user = auth()->user();

        $validated = $request->validated();

        $comment = $this->commentService->create($user, $task, $validated);

        return $this->fromResource(CommentResource::make($comment))
            ->addToResponse([
                'message' => 'Comment created successfully',
            ])
            ->toResponse();
    }

    public function destroy(Project $project, Task $task, Comment $comment)
    {

        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}
