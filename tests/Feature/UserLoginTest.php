<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Modules\User\Models\User;
use Tests\TestCase;

class UserLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_receive_token(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/user/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['name', 'email'],
                'auth' => ['token'],
            ])
            ->assertJsonPath('user.email', 'test@example.com');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/user/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'These credentials do not match our records.');
    }
}
