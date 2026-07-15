<?php

namespace App\Http\Controllers;

use App\Traits\JsonResponseFormatter;

abstract class Controller
{
    use JsonResponseFormatter;
}
