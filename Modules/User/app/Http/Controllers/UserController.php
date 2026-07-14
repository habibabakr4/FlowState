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

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('user::index');
    }

    /**
     * Show the form for creating a new resource.
     */
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

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('user::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('user::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
