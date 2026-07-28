<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LanguageController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $locale = $request->input('locale', 'ar');

        if (in_array($locale, ['en', 'ar'])) {
            session()->put('locale', $locale);
        }


        return redirect()->back();
    }
}
