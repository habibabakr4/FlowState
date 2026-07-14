<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Hash;
use Modules\User\Models\User;

class UserService
{
    public function generateToken(Authenticatable $user): string
    {
        //       delete all tokens to log out from all devices
        //        delete current token : $request->user()->currentAccessToken()->delete();
        $user->tokens()->delete();

        //       when create tokens & store abilities
        //       check abilities later $request->user()->tokenCan('create')
        return $user->createToken('dev-tool', ['*'])->plainTextToken;

    }

    public function create(array $validated): User
    {
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return $user;
    }

    public function get(array $validated): User|JsonResponse
    {
        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return $user;
    }
}
