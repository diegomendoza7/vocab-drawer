import { C } from "../theme.js";
import GlobalStyles from "./GlobalStyles.jsx";
import Rail from "./Rail.jsx";

/* The ≥1024px frame: a fixed rail beside a scrolling main column.
 *
 * The rail is full-height and does not scroll with the content, so navigation
 * stays put while a long drawer list or progress chart scrolls past it. */
export default function DesktopShell({
  activeSection, onNavigate, lang, onLangChange, level, badges, storageOn, theme, onThemeChange, children,
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
      />
      <main className="flex-1 min-w-0 overflow-x-hidden" style={{ padding: "22px 26px" }}>
        {children}
      </main>
    </div>
  );
}
