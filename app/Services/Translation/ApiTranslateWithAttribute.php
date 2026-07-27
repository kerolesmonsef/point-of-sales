<?php

namespace App\Services\Translation;

class ApiTranslateWithAttribute
{
    protected array $parameter_map = [];

    public function __construct(
        protected StichozaApiTranslate $translator,
        protected int $request_per_second,
        protected int $sleep_for_seconds,
        protected int &$request_count,
    ) {}

    protected function apiLimitCheck(): void
    {
        if ($this->request_count >= $this->request_per_second) {
            sleep($this->sleep_for_seconds);
            $this->request_count = 0;
        }
        $this->request_count++;
    }

    public function translateWithAttributes(string $text, string $locale, ?string $base_locale = null): string
    {
        $this->apiLimitCheck();

        $text = $this->preHandleParameters($text);
        $translated = $this->translator->translate($text, $locale, $base_locale);
        $translated = $this->postHandleParameters($translated);

        return $translated;
    }

    protected function findParameters(string $text): array
    {
        preg_match_all("/(^:|([\s|\:])\:)([a-zA-z])+/", $text, $matches);

        return $matches[0];
    }

    protected function replaceParametersWithPlaceholders(string $text, array $parameters): array
    {
        $parameter_map = [];
        $i = 1;
        foreach ($parameters as $match) {
            $parameter_map["x{$i}"] = $match;
            $text = str_replace($match, " x{$i}", $text);
            $i++;
        }

        return ['parameter_map' => $parameter_map, 'text' => $text];
    }

    protected function preHandleParameters(string $text): string
    {
        $parameters = $this->findParameters($text);
        $result = $this->replaceParametersWithPlaceholders($text, $parameters);
        $this->parameter_map = $result['parameter_map'];

        return $result['text'];
    }

    protected function postHandleParameters(string $text): string
    {
        foreach ($this->parameter_map as $key => $attribute) {
            $combinations = [
                $key,
                substr($key, 0, 1) . ' ' . substr($key, 1),
                strtoupper(substr($key, 0, 1)) . ' ' . substr($key, 1),
                strtoupper(substr($key, 0, 1)) . substr($key, 1),
            ];
            foreach ($combinations as $combination) {
                $text = str_replace($combination, $attribute, $text, $count);
                if ($count > 0) {
                    break;
                }
            }
        }

        return str_replace('  :', ' :', $text);
    }
}
