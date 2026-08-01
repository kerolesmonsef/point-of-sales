---
name: translating-pages-to-english
description: "Use when asked to translate a React page/component (or any JSX/JS string) to English, wrap UI strings with the __() translation helper, or fix pages showing non-English text. Triggers: 'translate this page to english', 'wrap with __', 'fix Indonesian text', or when a page still has hardcoded foreign-language strings."
---

# Translating Pages to English with `__()`

## Overview

This project renders English by default. `window.__ = (key) => window.__translations?.[key] ?? key` (`resources/js/bootstrap.js`) returns the string as-is when no translation exists — so **the English text you pass to `__()` is both the source key AND the displayed English fallback**. Translate in place; do not touch locale files.

## When to Use

- Translating a page/component to English
- Wrapping strings with `__()` to make them translatable
- Fixing hardcoded non-English text in JSX

## Core Pattern

Every user-facing string gets wrapped and becomes English:

```jsx
// Before (hardcoded Indonesian)
<h1>Pengaturan Diskon</h1>
<input placeholder="Nama Produk" />

// After
<h1>{__("Discount Settings")}</h1>
<input placeholder={__("Product name")} />
```

## Rules

1. **Wrap everything visible to the user** in `__("English")`:
   - JSX text: `{__("Save")}` (string literals, not `{save}`)
   - Attributes: `placeholder`, `title`, `label`, `aria-label`
   - `Head title={__("...")}`, `toast.success(__("..."))`, `confirm(__("..."))`
2. **Source string is English.** It is both the key and the on-screen fallback (`bootstrap.js`).
3. **Never edit `lang/*.json`.** Adding translation entries is optional; the English key already renders English.
4. **Don't translate code:** identifiers, variable/prop/state names, route names, API keys. Not user-facing.
5. **Don't rename files or component names** — the task is string translation only.
6. **Backend data values:** if a fixed vocabulary comes from the backend as a string (e.g. tier labels), wrap with `__()` at render if it's a known set; translate the source in the backend/seed if that's where it lives. Do not translate free-form data (product names, customer names).
7. **Don't add comments** while editing.

## Verification

Before declaring done, confirm:

```
grep -n '>[^<]*(Tambahan Indonesian text)<' <file>   # no non-English literals remain
```

Scan the file for any string literal that is not inside `__()` and is not a code identifier/data value. `{__("...")}` everywhere, English everywhere.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoded English, no `__()` wrapper | Wrap it: `{__("...")}` |
| Adding keys to `lang/*.json` | Don't — English key is the fallback |
| Translating variable/function names | Leave identifiers untouched |
| Translating product/customer data | Data is not UI text; leave it |
| `__` applied to a variable instead of a literal | `{__("Save")}`, not `{__(save)}` |
