# Project 3 — Interactive Web Elements
### DecodeLabs Frontend Development · Batch 2026

Five JavaScript-powered features demonstrating DOM manipulation, event handling, and state management. Every interaction follows the **IPO loop**: Input (user event) → Process (JS logic) → Output (DOM mutation).

---

## 🔗 Quick Links

| | |
|-|-|
| **Live Page** | `P3.html` |
| **Stylesheet** | `P3.css` |
| **JavaScript** | `P3.js` |
| **Author** | Danish Saeed |
| **Program** | DecodeLabs Batch 2026 |

---

## 🎯 Project Goal

Bring HTML and CSS to life with vanilla JavaScript. Demonstrate safe, maintainable DOM manipulation — without jQuery, without frameworks, and without a single use of `innerHTML` on user-generated content.

---

## ⚡ Features

### 1 — Dark Mode Toggle
Persistent theme switching between dark and light modes.

| IPO | Detail |
|-----|--------|
| **Input** | User clicks the 🌙/☀️ button in the header |
| **Process** | Flip `isDark` boolean, write preference to `localStorage` |
| **Output** | `data-theme` attribute on `<html>` updated → CSS custom properties cascade automatically |

```js
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
localStorage.setItem('dl-theme', isDark ? 'dark' : 'light');
```
Preference persists across page reloads and browser sessions.

---

### 2 — Tab Switcher
Accessible tab component with ARIA attributes.

| IPO | Detail |
|-----|--------|
| **Input** | User clicks a tab button |
| **Process** | Loop all buttons/panels, toggle `is-active` on the matching pair |
| **Output** | Correct panel shown; `aria-selected` and `hidden` attributes updated |

```js
btn.classList.toggle('is-active', isActive);
btn.setAttribute('aria-selected', String(isActive));
panel.removeAttribute('hidden'); // or setAttribute('hidden', '')
```
Uses `data-tab` attribute to match buttons to panels — no brittle index coupling.

---

### 3 — Accordion FAQ
Single-open accordion with smooth CSS animation.

| IPO | Detail |
|-----|--------|
| **Input** | User clicks an accordion button |
| **Process** | Check if item is already open; close all items; reopen if it was closed |
| **Output** | `is-open` class toggled → CSS `max-height` transition animates open/close |

```js
accordionItems.forEach(item => item.classList.remove('is-open'));
if (!isAlreadyOpen) clickedItem.classList.add('is-open');
```
`aria-expanded` attribute updated on each button for screen reader compatibility.

---

### 4 — Character Counter
Real-time feedback with threshold-based state classes.

| IPO | Detail |
|-----|--------|
| **Input** | User types in the `<textarea>` (`input` event) |
| **Process** | Calculate `value.length` vs 150-char limit; determine warning threshold |
| **Output** | `textContent` of counter updated; `is-warning` (≥120) / `is-error` (150) classes toggled |

```js
charCount.textContent = `${len} / ${MAX_CHARS}`;
charCount.classList.toggle('is-warning', len >= 120 && len < MAX_CHARS);
charCount.classList.toggle('is-error', len >= MAX_CHARS);
```
`aria-live="polite"` on the counter element — screen readers announce updates automatically.

---

### 5 — Dynamic Task List
Full CRUD task manager built entirely with `createElement`.

| IPO | Detail |
|-----|--------|
| **Input** | Click "Add" button or press `Enter`; click checkbox to complete; click ✕ to delete |
| **Process** | Validate input, build DOM node tree, append/remove from list, update count |
| **Output** | New `<li>` node appended via `appendChild`; removed via `element.remove()` after CSS transition |

```js
const li    = document.createElement('li');
const span  = document.createElement('span');
span.textContent = text;   // textContent only — XSS-safe
taskList.appendChild(li);  // appendChild — never innerHTML
```

**Delete flow:** `is-removing` class added → CSS transition plays → `setTimeout` removes node after 250ms.

**Empty state:** `.is-hidden` class toggled on the empty-state paragraph based on list child count.

---

### Bonus — Toast Notification System
A reusable utility that any feature can call to surface feedback.

```js
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;       // textContent — safe
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('is-removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```
Toasts auto-dismiss. `aria-live="assertive"` on the container — screen readers announce each notification immediately.

---

## 🧠 Engineering Conventions

### Naming Conventions
| Prefix | Purpose | Example |
|--------|---------|---------|
| `js-` | JavaScript hook — **never styled** | `.js-tab-btn`, `.js-task-input` |
| `is-` | Visual state — toggled by JS, **styled by CSS** | `.is-active`, `.is-open`, `.is-error` |

This decoupling means CSS and JS can evolve independently without breaking each other.

### Variable Declarations
```js
const el = document.querySelector('.js-hook');  // DOM ref — never reassigns
let count = 0;                                   // Mutable state
// var — never used (legacy, function-scoped, error-prone)
```

### Safe DOM Text Injection
```js
// ✅ Safe — treats content as plain text
element.textContent = userInput;

// ❌ Never used for user content — XSS vulnerability
element.innerHTML = userInput;
```
The only use of `innerHTML` in this project is `taskList.innerHTML = ''` — clearing own nodes, no user data involved.

### Function Design
Every function is **small and single-purpose**:
- `applyTheme()` — applies theme state to DOM
- `toggleTheme()` — flips state, persists, calls `applyTheme()`
- `switchTab(id)` — activates a tab by ID
- `toggleAccordion(item)` — opens/closes one accordion item
- `updateCharCount()` — recalculates and renders counter
- `createTaskNode(text)` — builds and returns one `<li>` element
- `addTask()` — validates, calls `createTaskNode`, appends
- `removeTask(li)` — animates and removes one task
- `showToast(msg)` — creates, appends, auto-removes a toast

### `'use strict'`
Enforced at the top of `P3.js`. Prevents accidental globals, catches silent errors, and disallows legacy syntax.

---

## 🎨 Theme System

Light/dark mode driven entirely by CSS custom properties — no class swapping on individual elements.

```css
:root { --clr-bg: #0f0e0e; --clr-text: #f0ede8; }

[data-theme="light"] { --clr-bg: #f5f4f0; --clr-text: #1a1918; }
```

Every component automatically updates when `data-theme` changes — `transition` on `background-color` and `color` creates a smooth crossfade.

---

## ✅ Quality Checklist

- [x] `'use strict'` — enforced globally
- [x] `const` for DOM references — `let` only for mutable state — no `var`
- [x] `textContent` only for user-generated content — never `innerHTML`
- [x] `js-` prefix — JS hooks never styled with CSS
- [x] `is-` prefix — state classes toggled by JS, styled by CSS
- [x] Functions — small, single-purpose, named descriptively
- [x] `aria-expanded` — updated on all accordion buttons
- [x] `aria-selected` — updated on all tab buttons
- [x] `hidden` attribute — used on inactive tab panels (not just CSS `display:none`)
- [x] `aria-live="polite"` — character counter announces to screen readers
- [x] `aria-live="assertive"` — toast container announces immediately
- [x] `aria-label` — on every dynamically created checkbox and delete button
- [x] Theme preference persisted in `localStorage`
- [x] Enter key triggers task add — keyboard-only users supported
- [x] Delete animation — `is-removing` → `setTimeout` → `remove()` pattern
- [x] W3C HTML Validator — zero errors
- [x] External CSS only — no inline styles

---

## 👤 Author

**Danish Saeed** — DecodeLabs Frontend Development Intern · Batch 2026
📧 [daanishsaeed593@gmail.com](mailto:daanishsaeed593@gmail.com)
🐙 [github.com/DanishCoderX](https://github.com/DanishCoderX)
