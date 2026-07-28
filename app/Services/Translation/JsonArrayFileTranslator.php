<?php

namespace App\Services\Translation;

use Illuminate\Support\Facades\Config;
use Symfony\Component\Finder\Finder;

class JsonArrayFileTranslator
{
    protected int $total_count = 0;

    protected array $parameter_map = [];

    public function __construct(
        protected string $base_locale,
        protected bool $verbose = true,
        protected bool $force = false,
        protected int $request_per_second = 5,
        protected int $sleep_for_seconds = 1,
        protected int $request_count = 0,
    ) {}

    public function line(string $text): void
    {
        if ($this->verbose) {
            $this->output?->writeln($text);
        }
    }

    public function setOutput($output): void
    {
        $this->output = $output;
    }

    public function handle(string $target_locale): void
    {
        $stringKeys = $this->exploreStrings();
        $existing_translations = $this->fetchExistingTranslations($target_locale);

        $progress = $this->output?->createProgressBar(count($stringKeys));
        $progress?->start();

        $translated_strings = $existing_translations;
        $path = lang_path("{$target_locale}.json");

        foreach ($stringKeys as $key) {
            if (isset($translated_strings[$key]) && $translated_strings[$key] !== '' && ! $this->force) {
                $progress?->advance();

                continue;
            }

            $translator = new StichozaApiTranslate;
            $translationObject = new ApiTranslateWithAttribute($translator, $this->request_per_second, $this->sleep_for_seconds, $this->request_count);

            $translated = $translationObject->translateWithAttributes($key, $target_locale, $this->base_locale);
            $translated_strings[$key] = addslashes($translated);

            $this->writeJson($path, $translated_strings);
            $progress?->advance();
        }

        $progress?->finish();
        $this->line('');
        $this->writeJson($path, $translated_strings);
        $this->line("total found is : {$this->total_count}");
    }

    protected function writeJson(string $path, array $data): void
    {
        file_put_contents(
            $path,
            json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
        );
    }

    protected function fetchExistingTranslations(string $target_locale): array
    {
        $path = lang_path("{$target_locale}.json");

        if (! file_exists($path)) {
            return [];
        }

        return json_decode(file_get_contents($path), true) ?: [];
    }

    protected function exploreStrings(): array
    {
        $stringKeys = [];
        $functions = Config::get('translate.functions', [
            '__',
            'trans',
            'trans_choice',
            'Lang::get',
            'Lang::choice',
            '@lang',
            '@choice',
        ]);

        $directories = Config::get('translate.directories', [app_path()]);
        $patterns = Config::get('translate.patterns', ['*.php']);

        $finder = new Finder;
        $finder->in($directories);

        foreach ($patterns as $pattern) {
            $finder->name($pattern);
        }

        $finder->files();

        $stringPattern =
            "[^\w]".
            '('.implode('|', $functions).')'.
            "\(".
            "(?P<quote>['\"])".
            "(?P<string>(?:\\\k{quote}|(?!\k{quote}).)*)".
            "\k{quote}".
            "[\),]";

        $count = 0;

        foreach ($finder as $file) {
            if (preg_match_all("/{$stringPattern}/siU", $file->getContents(), $matches)) {
                foreach ($matches['string'] as $key) {
                    if (preg_match("/(^[a-zA-Z0-9_-]+([.][^\1)\ ]+)+$)/siU", $key, $groupMatches)) {
                        continue;
                    }

                    if (! (mb_strpos($key, '::') !== false && mb_strpos($key, '.') !== false)
                        || mb_strpos($key, ' ') !== false) {
                        $stringKeys[] = $key;
                        $count++;
                        $this->line("{$count} Found : {$key}");
                    }
                }
            }
        }

        $stringKeys = array_unique($stringKeys);
        $this->total_count = $count;

        return $stringKeys;
    }
}
