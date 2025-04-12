<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ShowsController extends Controller
{
public function index()
{
    return Inertia::render('Shows');
}
}
