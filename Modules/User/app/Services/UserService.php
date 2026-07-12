<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Auth\Authenticatable;

class UserService
{
    public function generateToken(Authenticatable $user): string{
//       delete all tokens to log out from all devices
//        delete current token : $request->user()->currentAccessToken()->delete();
        $user->tokens()->delete();
//       when create tokens & store abilities
//       check abilities later $request->user()->tokenCan('create')
        return $user->createToken('dev-tool', ['*'])->plainTextToken;

    }
}
