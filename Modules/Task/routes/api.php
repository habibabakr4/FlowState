<?php

use Illuminate\Support\Facades\Route;
use Modules\Task\Http\Controllers\TaskController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::post('project/{project}/task', [TaskController::class,'store']);
    Route::get('project/{project}/task', [TaskController::class,'index']);
    Route::get('project/{project}/task/{task}', [TaskController::class,'show']);
});
