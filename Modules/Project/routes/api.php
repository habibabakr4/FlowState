<?php

use Illuminate\Support\Facades\Route;
use Modules\Project\Http\Controllers\ProjectController;

Route::prefix('v1')->group(function () {

    Route::prefix('projects')
        ->controller(ProjectController::class)
        ->middleware(['auth:sanctum'])
        ->group(function () {
            Route::post('', 'store');
            Route::get('', 'index');
            Route::get('/{project}', 'show');
    });
});