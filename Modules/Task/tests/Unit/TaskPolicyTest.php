<?php

namespace Modules\Task\Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Modules\Project\Models\Project;
use Modules\User\Models\User;
use Tests\TestCase;

class TaskPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_tasks_for_their_project(): void
    {
        $user = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password'),
        ]);
        $project = Project::create([
            'name' => 'Demo project',
            'description' => 'Test project',
            'status' => 'active',
            'owner_id' => $user->id,
        ]);

        $this->assertTrue(Gate::forUser($user)->check('createTask', $project));
    }

    public function test_non_owner_cannot_create_tasks_for_another_users_project(): void
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password'),
        ]);
        $otherUser = User::create([
            'name' => 'Other',
            'email' => 'other@example.com',
            'password' => bcrypt('password'),
        ]);
        $project = Project::create([
            'name' => 'Demo project',
            'description' => 'Test project',
            'status' => 'active',
            'owner_id' => $owner->id,
        ]);

        $this->assertFalse(Gate::forUser($otherUser)->check('createTask', $project));
    }
}
