<?php

namespace Modules\Dashboard\Services;

use Modules\User\Models\User;

class DashboardService
{
    public function getDashboardData(User $user): array
    {
        //        $totalProjects = $user->projects()->count();
        //
        //        $activeProjects = $user->projects()->where('status', 'active')->count();
        //
        //        $completedProjects = $user->projects()->where('status', 'completed')->count();
        //
        $recentProjects = $user->projects()->latest()->take(3)->get();

        //         ✅ One query, group by status
        $counts = $user->projects()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $activeProjects = $counts['active'] ?? 0;
        $completedProjects = $counts['completed'] ?? 0;
        $totalProjects = $activeProjects + $completedProjects;

        return [
            'total_projects' => $totalProjects,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'recent_projects' => $recentProjects,
        ];
    }
}
