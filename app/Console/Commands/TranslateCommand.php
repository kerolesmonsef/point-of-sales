<?php

namespace App\Console\Commands;

use App\Services\Translation\JsonArrayFileTranslator;
use Illuminate\Console\Command;

class TranslateCommand extends Command
{
    protected $signature = 'translate
        {locale=ar : Target locale code (e.g., ar, id, ms, zh-CN)}
        {--force : Re-translate existing keys}
        {--no-verbose : Suppress output}';

    protected $description = 'Scan source files for translatable strings and auto-translate them via Google Translate';

    public function handle(): int
    {
        $locale = $this->argument('locale');
        $force = $this->option('force') || config('translate.force');
        $verbose = ! $this->option('no-verbose') && config('translate.verbose');

        $translator = new JsonArrayFileTranslator(
            base_locale: config('translate.base_locale', 'en'),
            verbose: $verbose,
            force: $force,
            request_per_second: config('translate.request_per_second', 5),
            sleep_for_seconds: config('translate.sleep_for_seconds', 1),
        );

        $translator->setOutput($this->output);

        $this->components->info("Scanning files and translating to '{$locale}'...");

        $translator->handle($locale);

        $this->components->info("Done. Translations saved to lang/{$locale}.json");

        return self::SUCCESS;
    }
}
