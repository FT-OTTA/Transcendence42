# Browser Compatibility Research

## Our Approach

We targeted three browsers: **Chrome**, **Firefox**, and **Brave**. Instead of having everyone do a dedicated testing phase with the 3 browsers, we each picked one browser to use daily. Issues surfaced naturally as we worked, which saved a lot of time.

---

## Why Browsers Differ

Chrome and Brave are both built on **Chromium** with the **Blink** engine, so they behave identically. Firefox runs on **Gecko**, a completely separate engine with its own CSS implementation and its own schedule for adopting new features.

In practice, Chromium browsers tend to ship new CSS features earlier and are more permissive. Firefox is stricter and sometimes needs a different syntax or a fallback to achieve the same result.

---

## What Already Works Everywhere

Most of the codebase needed no changes at all. Things like our custom `@keyframes` animations (`fb-play-top`, `fb-combat`, `fb-death`), fixed overlays and z-index stacking, flexbox and grid layouts, and arbitrary Tailwind values like `shadow-[0_0_8px_rgba(...)]` all behave consistently across Blink and Gecko.

---

## What We Fixed

### backdrop-blur in Firefox

Firefox only added `backdrop-filter` support in v103. On older versions, any element using `backdrop-blur` becomes fully transparent with no blur, making modals and the navbar nearly invisible. This hit `Navbar.tsx`, `LoginCard.tsx`, `LoggedInBadge.tsx` and the lobby overlays.

We added a `@supports` fallback in `globals.css` that kicks in when the property is unavailable:

```css
@supports not (backdrop-filter: blur(1px)) {
  [class*="backdrop-blur"] {
    background-color: rgba(0, 0, 0, 0.85) !important;
  }
}
```

Older Firefox now gets a solid dark background instead of a frosted one. Not pixel-perfect, but readable and functional.

### Custom Scrollbar Styling in Firefox

Our `custom-scrollbar` class was only defined with `::-webkit-scrollbar` rules, which is a Chromium-only API. Firefox ignores it completely and shows the default OS scrollbar instead, making the chat, friends, and rooms panels look inconsistent.

```css
/* Firefox ignores all of this */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 211, 252, 0.25); }
```

Firefox uses `scrollbar-width` and `scrollbar-color` instead. We added those alongside the existing rules:

```css
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(125, 211, 252, 0.25) transparent;
}
```

Both sets of rules now live in `globals.css`. Chrome and Brave pick up the webkit ones, Firefox picks up its own.

One thing worth noting is that the two APIs do not give the same degree of control. The webkit API lets you control exact pixel width, border radius, hover states, and track styling separately. Firefox's API is intentionally minimal: `scrollbar-width` only accepts `auto` or `thin`, and `scrollbar-color` gives you one color for the thumb with no hover state.