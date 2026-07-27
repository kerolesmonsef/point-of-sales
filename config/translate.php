<?php

return [

    'base_locale' => env('TRANSLATE_BASE_LOCALE', 'en'),

    'request_per_second' => 5,

    'sleep_for_seconds' => 1,

    'force' => env('TRANSLATE_FORCE', false),

    'verbose' => env('TRANSLATE_VERBOSE', true),

    'functions' => [
        '__',
        'trans',
        'trans_choice',
        'Lang::get',
        'Lang::choice',
        '@lang',
        '@choice',
    ],

    'directories' => [
        app_path(),
        resource_path('js'),
    ],

    'patterns' => ['*.php', '*.jsx', '*.tsx', '*.js'],
];
