<?php

namespace App\Http\Controllers;

use App\Traits\JsonResponseFormatter;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use JsonResponseFormatter;
    use AuthorizesRequests;
}
