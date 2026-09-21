<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Display the Team Directory page.
     */
    public function index(): Response
    {
        return Inertia::render('Team');
    }
}
