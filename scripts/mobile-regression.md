# Mobile regression check (desktop restructure)

The desktop restructure must leave every screen below 1024px byte-for-byte
unchanged. This is how that gets verified — visual spot-checks are not enough,
a wrong wrapper breaks all 37 screens silently and identically.

## Method (current: computed-style fingerprint)

**Superseded the raw-DOM hash** when the palette moved to CSS variables. Inline
styles now read `var(--vd-ink)` rather than `#1F2A44`, so the markup text
changed everywhere while the rendering did not — a raw-HTML hash reports that
as a total regression, which is useless. Fingerprint the *resolved* values
instead:

```js
window.__fp = () => {
  const els = [...document.getElementById('root').querySelectorAll('*')];
  return h(els.map(e => { const c = getComputedStyle(e);
    return e.tagName+'|'+c.color+'|'+c.backgroundColor+'|'+c.fontFamily+'|'+c.fontSize+'|'+c.borderTopColor+'|'+c.display;
  }).join('~'));
};
```

This compares what the user actually sees, is immune to hex-vs-`var()`, and
needs no greeting normalisation (the greeting's *text* varies, its computed
style does not). Baseline lives in `localStorage.__vd_baseline_computed`.

Note it still moves with progress data on `setup`/`View progress` — element
*count* changes when the due list or heatmap does. See the gotcha below.

## Method (original: raw DOM hash)

Run the app, set the viewport to 375x812, and hash the rendered DOM of each
screen. Compare against a baseline captured before the change.

**Timing matters.** React does not settle the DOM within the same synchronous
block as the `click()` that triggered navigation, so hashing immediately after
clicking reads the *previous* screen. Both of these produce false failures:

- click + hash in one `javascript_tool` call
- several steps inside one `browser_batch` (no settle time between them)

Use one tool call per step, letting the natural round-trip latency settle the
DOM: each call hashes what the *previous* call navigated to, then clicks the
next target. `window.__step()` below implements that.

## Setup (run once, before changing anything)

```js
// hash helper + baseline capture, at 375px, from the home screen
const h = s => { let x=5381; for (let i=0;i<s.length;i++) x=((x<<5)+x+s.charCodeAt(i))>>>0; return x.toString(16); };
window.__h = h;
// navigate to each screen and record h(document.getElementById('root').innerHTML)
// then: localStorage.setItem('__vd_baseline_hashes', JSON.stringify(hashes))
```

## Stepper (one tool call per invocation)

```js
window.__step = () => {
  const bb = JSON.parse(localStorage.getItem('__vd_baseline_hashes'));
  const starts = t => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim().startsWith(t)); if(b){b.click();return true;} return false; };
  const home = () => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='Home'); if(b)b.click(); };
  if (window.__i >= 0) {
    const t = window.__targets[window.__i];
    const cur = window.__h(document.getElementById('root').innerHTML);
    window.__res.push({ s: t, match: cur === bb[t] });
  }
  window.__i++;
  if (window.__i >= window.__targets.length) return 'done';
  home(); setTimeout(() => starts(window.__targets[window.__i]), 60);
  return 'navigating to ' + window.__targets[window.__i];
};
```

Screens reachable one click from home: Reading Corner, Sentence Constructions,
Phrase Match, Listening & Speaking, Grammar & Verbs, My Words, Import Your Own
Text, View progress — plus `setup` itself. Deeper screens (study pipeline,
conjugation wizard, My Words review) need their own drive-through and should be
covered at the Phase 5 sweep.

## Result log

- **theme.js extraction** (C/GENDER moved to `src/theme.js`): 9/9 identical.
- **MobileShell extraction** (wrapper/header/StepDots → `components/MobileShell.jsx`): 9/9 identical.
- **Classical theme, desktop-scoped** (tokens → CSS vars, Cormorant Garamond +
  Lora inside `.vd-classical`): mobile computed palette unchanged — all six
  colours in use on the home screen map exactly to the original tokens, zero
  unknown colours; heading font still Special Elite, shell still `#E7DCBE` on
  `#1F2A44`. Raw-DOM baseline retired here; computed baseline re-captured.
- **Phase 5 sweep** (all rail sections, both widths): desktop 9/9 render with
  content and zero console errors (Study 149 nodes, Grammar 156, Progress 489,
  smallest Phase Match 16). Mobile 9/9 render, zero errors; computed
  fingerprints 4/9 exact — Reading Corner, Sentence Constructions, Phrase Match,
  Listening & Speaking, i.e. every screen with no progress-derived content. The
  other five (setup, Grammar, My Words, Import, View progress) all display
  counts that changed during testing (3 words saved, 5 conjugation cards
  seeded). Static check alongside it: all 37 navigable screen values still have
  a render branch, so nothing was orphaned by the restructure.
- **Phase 4** (grammar workbench + coverage matrix): mobile `grammarHub`
  unchanged — still the original hub, not the workbench, and no `.vd-classical`
  scope. `navigateToSection` branches on `isDesktop` so only desktop routes to
  `grammarWorkbench`. Hash comparison not meaningful for this screen: it renders
  due counts and coverage bars, and the run seeded conjugation cards.
- **Phase 3** (My Words workspace + diff review table): `My Words` computed
  fingerprint identical after extracting the add-words form into a shared node;
  the mobile input screen still renders its heading, tabs, textarea and back
  button. `setup` / `Import Your Own Text` not comparable in this run — saving
  three words changed the counts they display (see the progress-data gotcha).
- **Phase 2** (study stage rail + ledger, per-word summary): 7/9 identical.
  The two that differed, `setup` and `View progress`, are the only screens that
  render progress-derived numbers, and the run had mutated `progress.cards`
  (see "Gotcha: progress-dependent screens" below). Mobile markup is unchanged
  by construction — the mobile path is `<MobileShell>{screens}</MobileShell>`
  and Phase 2 added only a branch inside the `isDesktop` return.

## Gotcha: the home screen randomises its greeting

`setup` renders a random greeting (`bonjour`/`merci`/…) in
`.font-type.text-5xl.mb-3.stamp`, so raw DOM hashes never match across runs.
Normalise before hashing:

```js
const norm = s => s.replace(/(class="font-type text-5xl mb-3 stamp"[^>]*>)[^<]*(<)/g, '$1GREETING$2');
```

A single `false` on the *first* target of a stepper run is usually a settle
artifact, not a regression — re-check that screen on its own before believing it.

## Gotcha: progress-dependent screens

`setup` and `View progress` render counts derived from `progress.cards` (due
count, words started, maturity chart, heatmap). Any run that studies words — or
seeds cards to set up a test — changes those numbers, so their hashes stop
matching a baseline captured under different data. That is a data difference,
not a regression.

Either re-capture the baseline immediately before the check under the same
progress state, or treat those two screens as inconclusive and fall back to
reasoning about the render path. Storing the normalised HTML alongside the hash
would make mismatches diffable instead of merely detectable — worth doing next
time a baseline is captured.

## Gotcha: emulated resizes do not fire `matchMedia`

`useIsDesktop` listens for the media query's `change` event. Real browser
window resizes fire it; the automation's viewport emulation often does not, so
the app keeps rendering the previous layout at the new width. **Reload after
changing the viewport** before concluding anything about which layout renders.
