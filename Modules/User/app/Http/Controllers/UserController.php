<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\User\Http\Requests\LoginRequest;
use Modules\User\Http\Requests\RegisterRequest;
use Modules\User\Models\User;
use Modules\User\Services\UserService;
use Modules\User\Transformers\UserResource;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}


    public function register(RegisterRequest $request): JsonResponse
    {
        //        validate data
        //        hash password
        //        create user
        //        log out (delete all tokens to log out from all devices) if exist
        //        generate token
        //        log him in
        //        return user and access token

        $validated = $request->validated();

        $user = $this->userService->create($validated);

        $generatedToken = $this->userService->generateToken($user);

        return $this
            ->fromResource(UserResource::make($user))
            ->addToResponse([
                'auth' => [
                    'token' => $generatedToken,
                ],
            ])
            ->toResponse();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        //        validate
        //        get user by email
        //        check password
        //        if password is correct, generate token
        //        return user and access token
        $validated = $request->validated();

        $user = $this->userService->get($validated);

        $generatedToken = $this->userService->generateToken($user);

        return $this
            ->fromResource(UserResource::make($user))
            ->addToResponse([
                'auth' => [
                    'token' => $generatedToken,
                ],
            ])
            ->toResponse();
    }

}
