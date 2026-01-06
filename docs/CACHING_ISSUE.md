# Dashboard Uskup - Caching & Styling Issue Documentation

## Problem Overview

This project has a **persistent caching issue** where code changes (especially CSS/JS) do not reflect in the browser even after:
- Browser hard refresh (Ctrl+Shift+R)
- Clearing browser cache
- Clearing `.next` folder

Additionally, relying on **JavaScript/DOM manipulation** for styling (via `useEffect`) is **unreliable** because React re-renders or hydration often revert these changes, leading to a "flickering" or "reverting" UI state.

## Validated Solutions

### 1. CSS Injection (Recommended for Styling)

For persistent styling that resists re-renders and caching issues, **do not use `globals.css` or JS-based inline styles**. Instead, inject a scoped `<style>` tag directly in your component's JSX.

**Why this works:**
- Styles are part of the React Component lifecycle.
- Re-renders automatically re-apply the style tag.
- You can use `!important` to force overrides against external libraries (like `react-day-picker`).

**Pattern:**
```tsx
export default function MyComponent() {
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Your styles here */
        .target-class {
          property: value !important;
        }
      `}} />
      {/* Component content */}
    </div>
  )
}
```

### 2. Change Port (Recommended for Logic/Structure)

For profound changes to logic or file structure, the most reliable way to clear the dev server cache is to **change the port**.

```batch
# Stop server (Ctrl+C)
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx next dev -p 3001  # Increment port number
```

### 3. Use `start.bat` script

The `start.bat` file automates the cleanup process:
```batch
.\start.bat
```

## Deprecated/Failed Approaches

### ❌ Modifying `globals.css`
Custom rules in `globals.css` often fail to load or get purged by Tailwind v4's JIT engine if not configured perfectly.
*Verdict: Unreliable in this environment.*

### ❌ JS-based `useEffect` Styling
Using `useEffect` to find DOM elements and set `style.cssText` causes race conditions. React's hydration or subsequent re-renders will often reset the DOM, causing elements to "revert" to their original unstyled state.
*Verdict: Do NOT use for persistent layout.*

## React-Day-Picker v9 Reference

The calendar component (`react-day-picker` v9) structure is different from v8:
- NO `<nav>` element exists.
- Buttons (`rdp-button_previous`, `rdp-button_next`) are direct children of `.rdp-month`.
- Layout is best controlled via **CSS Grid** on the `.rdp-month` container.

**Correct Selectors for CSS Injection:**
```css
.rdp-month { display: grid; ... }
.rdp-button_previous { grid-column: 1; ... }
.rdp-month_caption { grid-column: 2; ... }
.rdp-button_next { grid-column: 3; ... }
```

---
*Last updated: January 2026*
