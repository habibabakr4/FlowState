<?php

namespace Modules\Comment\Services;

use Illuminate\Support\Collection;
use Modules\Comment\Models\Comment;
use Modules\Task\Models\Task;
use Modules\User\Models\User;

class CommentService
{
    public function create(User $user, Task $task, array $validated): Comment
    {

        // ✅ Through relationship

        $comment = $task->comments()->create([
            'created_by' => $user->id,
            'body' => $validated['body'],
        ]);

        return $comment;
    }

    public function get(User $user, Task $task): Collection
    {
        return Comment::where('task_id', $task->id)
            ->latest()
            ->get();
    }
}
