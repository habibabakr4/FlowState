<?php

namespace App\Rules;

use Illuminate\Validation\Rules\Password as PasswordRule;

class Password extends PasswordRule
{
    public static function default()
    {
        return static::min(8)
            ->rules([
                'string', 'max:32',
            ])
            ->mixedCase()
            ->symbols()
            ->numbers();
    }
}
