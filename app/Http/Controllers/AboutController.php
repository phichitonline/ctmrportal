<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * Display the About Cyber Security Team page.
     */
    public function index(): Response
    {
        return Inertia::render('About', [
            'stats' => [
                'nodes' => 613,
                'hospitals' => 12,
                'availability' => '99.9%',
                'sla' => '< 15 นาที',
            ],
            'lastUpdated' => now()->timezone('Asia/Bangkok')->format('H:i:s'),
        ]);
    }
}
