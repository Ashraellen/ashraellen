# Frontend rules for Ashraellen.com

## Page-specific CSS rule

Every unique page that exists in multiple language versions must have its own dedicated CSS file.

Examples:

- `/research/method/` → `assets/method.css`
- `/research/texts/` → `assets/research-texts.css`
- `/books/monolith/` → `assets/monolith.css`
- `/public/posts/` → `assets/posts.css`

## General principle

- Shared layout, typography, header, menu, and basic text-page structure live in shared CSS files such as `assets/texts.css`.
- Page-specific backgrounds, page-specific blocks, cards, manifests, archives, buttons, and visual mood live in that page's own CSS file.
- Language HTML files should contain text, structure, navigation, metadata, and CSS links only.
- Avoid inline `<style>...</style>` blocks inside language pages unless it is a temporary emergency fix.

## HTML pattern

Each language version of a page should connect the shared base CSS and its page-specific CSS:

```html
<link rel="stylesheet" href="../../../assets/texts.css?v=YYYYMMDD-1">
<link rel="stylesheet" href="../../../assets/method.css?v=YYYYMMDD-1">
```

The main page wrapper should have a unique page class:

```html
<div class="page method-page">
```

For another page:

```html
<div class="page monolith-page">
```

## Why this rule exists

This keeps all language versions visually synchronized while avoiding repeated CSS inside each translated HTML file. One page, one visual logic, one CSS file.
