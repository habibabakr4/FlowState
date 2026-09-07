<?php

namespace Modules\Dashboard\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Dashboard\Services\DashboardService;
use Modules\User\Transformers\UserResource;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index()
    {
        $user = auth()->user();

        $dashboardData = $this->dashboardService->getDashboardData($user);

        return $this->fromResource(UserResource::make($user))->addToResponse($dashboardData)->toResponse();

    }
}
