import { C } from "../theme.js";
import GlobalStyles from "./GlobalStyles.jsx";
import Rail from "./Rail.jsx";
import { CONTENT_MAX } from "../lib/sections.js";

/* The ≥1024px frame: a fixed rail beside a scrolling main column.
 *
 * The rail is full-height and does not scroll with the content, so navigation
 * stays put while a long drawer list or progress chart scrolls past it. */
export default function DesktopShell({
  activeSection, onNavigate, lang, onLangChange, level, badges, storageOn, theme, onThemeChange,
  typeScale, onTypeScale, children,
}) {
  return (
    /* `vd-classical` scopes the handoff's palette and type to the desktop tree.
     * Every screen inside it styles through the same `C` tokens as mobile, so
     * they re-theme without knowing which shell they are in. */
    <div className="vd-classical min-h-screen w-full flex" style={{ backgroundColor: C.paper, fontFamily: "var(--vd-body)", color: C.ink }}>
      <GlobalStyles />
      <Rail
        activeSection={activeSection}
        onNavigate={onNavigate}
        lang={lang}
        onLangChange={onLangChange}
        level={level}
        badges={badges}
        storageOn={storageOn}
        theme={theme}
        onThemeChange={onThemeChange}
        typeScale={typeScale}
        onTypeScale={onTypeScale}
      />
      {/* The rail is fixed, so the main column carries all the flex. Its
        * padding scales with the viewport rather than sitting at a constant
        * 26px, which looks mean at 2560px and wasteful at 1024. The inner
        * div is what caps and centres: past `CONTENT_MAX` the content stops
        * growing and takes the middle, instead of stretching a card grid to
        * arm's length across a wide monitor. */}
      <main
        className="flex-1 min-w-0 overflow-x-hidden"
        style={{ padding: "clamp(16px, 2.2vw, 40px) clamp(18px, 2.6vw, 56px)" }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: CONTENT_MAX }}>
          {children}
        </div>
      </main>
    </div>
  );
}
