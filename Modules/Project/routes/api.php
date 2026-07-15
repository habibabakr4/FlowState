<?php

use Illuminate\Support\Facades\Route;
use Modules\Project\Http\Controllers\ProjectController;

Route::middleware(['auth:sanctum'])->prefix('v1/projects')->group(function () {
    Route::post('', [ProjectController::class, 'store']);
    Route::get('/{project}', [ProjectController::class, 'show']);
    Route::get('', [ProjectController::class, 'index']);
});
