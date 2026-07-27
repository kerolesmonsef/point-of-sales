<?php

namespace App\Services\Translation;

use Stichoza\GoogleTranslate\GoogleTranslate;

class StichozaApiTranslate
{
    public function __construct(
        protected GoogleTranslate $handle = new GoogleTranslate,
    ) {}

    public function translate(string $text, string $locale, ?string $base_locale = null): string
    {
        if ($base_locale === null) {
            $this->handle->setSource();
        } else {
            $this->handle->setSource($base_locale);
        }

        $this->handle->setTarget($locale);

        $result = $this->handle->translate($text);

        return $result !== null ? $result : $text;
    }
}
