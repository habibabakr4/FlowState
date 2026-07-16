<?php

namespace Modules\User\Services;

use Modules\User\Models\User;

class DashboardService
{
    public function getDashboardData(User $user) : array
    {
        $totalProjects = $user->projects()->count();

        $activeProjects = $user->projects()->where('status', 'active')->count();

        $completedProjects = $user->projects()->where('status', 'completed')->count();

        $recentProjects = $user->projects()->latest()->take(3)->get();
        return [
            'total_projects' => $totalProjects,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'recent_projects' => $recentProjects,
        ];
    }
}
