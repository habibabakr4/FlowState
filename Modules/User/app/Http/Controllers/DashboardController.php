<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\User\Services\DashboardService;
use Modules\User\Transformers\UserResource;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService){}

    public function index()
    {
        $user = auth()->user();

        $dashboardData = $this->dashboardService->getDashboardData($user);

        return $this->fromResource(UserResource::make($user))->addToResponse($dashboardData)->toResponse();

    }

}
