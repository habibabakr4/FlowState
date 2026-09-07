<?php

use Illuminate\Support\Facades\Route;
use Modules\Comment\Http\Controllers\CommentController;

//
// Route::middleware(['auth:sanctum'])->prefix('v1/project/{project}/task/{task}/comment')->group(function () {
//
//    Route::resource('', CommentController::class)->only(['store', 'index', 'destroy']);
// });

// Laravel can automatically verify that the task belongs to the project and the comment belongs to the task using scoped bindings:
Route::middleware(['auth:sanctum'])->prefix('v1')->scopeBindings()->group(function () {
    Route::resource('project.task.comment', CommentController::class)
        ->only(['index', 'store', 'destroy']);
});
