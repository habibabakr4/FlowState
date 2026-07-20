<?php

use Illuminate\Support\Facades\Route;
use Modules\Dashboard\Http\Controllers\DashboardController;

Route::middleware(['auth:sanctum'])->prefix('v1/dashboard')->group(function () {
    Route::get('', [DashboardController::class, 'index']);
});
