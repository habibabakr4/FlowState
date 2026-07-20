<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\UserController;

Route::prefix('v1')->group(function () {
    Route::prefix('user')
        ->controller(UserController::class)
        ->group(function () {
            Route::post('register', 'register');
            Route::post('login', 'login');
        });
});
