import { missionsFor } from "../data/missions.js";
import { todayKey } from "../lib/srs.js";
import { fitDailyRoute } from "../lib/daily-route.js";
import { useIsDesktop } from "../hooks/useIsDesktop.js";

export default function TodayDashboard({
  lang,
  level,
  progress,
  onPreferences,
  onAction,
  due,
  weak,
  waiting,
  loaded,
  onLanguage,
  onLevel,
}) {
  const preferences = progress.preferences || {};
  const isDesktop = useIsDesktop();
  const minutes = preferences.minutes || 15,
    goal = preferences.goal || "everyday";
  const missions = missionsFor(lang, level, goal);
  const next =
    missions.find((m) => !progress.missions?.[m.id]?.completedAt) ||
    missions[0];
  const journalDue = (progress.journal || []).find(
    (e) => e.lang === lang && e.reviewOn <= todayKey() && !e.revisedAt,
  );
  const phrases = (progress.phrasebook || []).filter(
    (p) => p.lang === lang && (!p.card || p.card.due <= todayKey()),
  );
  const tasks = fitDailyRoute(
    [
      due
        ? {
            label: `Recall ${Math.min(due, Math.max(5, minutes))} due words`,
            why: "A brief review of what is ready now.",
            action: "review",
            minutes: Math.min(5, Math.round(minutes / 3)),
          }
        : next
          ? {
              label: `Learn: ${next.title}`,
              why: next.canDo,
              action: "missions",
              missionId: next.id,
              minutes: next.minutes,
            }
          : null,
      {
        label: "Listen for meaning",
        why: "Follow a short dialogue before opening its transcript.",
        action: "listeningLab",
        missionId: next?.id,
        minutes: 3,
      },
      journalDue
        ? {
            label: "Revisit your writing",
            why: "Rewrite yesterday’s idea without copying the correction.",
            action: "journal",
            minutes: 4,
          }
        : {
            label: "Say or write something personal",
            why: "Use the language to express your own meaning.",
            action: "journal",
            minutes: 4,
          },
      phrases.length
        ? {
            label: `Recall ${phrases.length} saved phrases`,
            why: "Bring useful language from real texts into memory.",
            action: "phrasebook",
            minutes: 3,
          }
        : weak
          ? {
              label: "Repair one weak spot",
              why: "Give a difficult word a different context.",
              action: "weak",
              minutes: 3,
            }
          : {
              label: "Try a sound contrast",
              why: "Listen, compare, and record your own version.",
              action: "pronunciation",
              minutes: 3,
            },
    ].filter(Boolean),
    minutes,
  );
  const practiced = Math.floor(
    Object.values(progress.practiceTime?.[lang]?.[todayKey()] || {}).reduce(
      (n, s) => n + s,
      0,
    ) / 60,
  );
  const completedToday = Object.values(progress.missions || {}).filter(
    (m) =>
      m.lang === lang &&
      Number.isFinite(Date.parse(m.completedAt)) &&
      todayKey(new Date(m.completedAt)) === todayKey(),
  ).length;
  return (
    <div className="vd-stack">
      <section className="vd-panel">
        <div className="vd-kicker">Your daily route</div>
        <h1>Today in {lang === "fr" ? "French" : "German"}</h1>
        <p>
          A little recall, meaningful listening, and something of your own.
          Choose a route you can finish.
        </p>
        <details open={isDesktop}>
          <summary
            className="vd-muted"
            style={{ padding: "10px 0", cursor: "pointer" }}
          >
            {level} · {minutes} minutes · Customize your route
          </summary>
          <div className="vd-grid">
            <label className="vd-field">
              Language
              <select
                aria-label="Language"
                className="vd-input"
                value={lang}
                onChange={(e) => onLanguage(e.target.value)}
              >
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </label>
            <label className="vd-field">
              Vocabulary starting point
              <select
                aria-label="Vocabulary starting point"
                className="vd-input"
                value={level}
                onChange={(e) => onLevel(e.target.value)}
              >
                {["A1", "A2", "B1", "B2", "C1"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="vd-field">
              Practice time
              <select
                aria-label="Practice time"
                className="vd-input"
                value={minutes}
                onChange={(e) =>
                  onPreferences({
                    ...preferences,
                    minutes: Number(e.target.value),
                  })
                }
              >
                {[5, 10, 15, 20, 30].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </label>
            <label className="vd-field">
              What matters to you?
              <select
                className="vd-input"
                value={goal}
                onChange={(e) =>
                  onPreferences({ ...preferences, goal: e.target.value })
                }
              >
                {[
                  ["everyday", "Everyday life"],
                  ["travel", "Travel"],
                  ["work", "Work"],
                  ["family", "People and family"],
                  ["interests", "Books, films, and interests"],
                ].map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="vd-check">
            <input
              type="checkbox"
              checked={preferences.trackTime !== false}
              onChange={(e) =>
                onPreferences({ ...preferences, trackTime: e.target.checked })
              }
            />
            Count approximate active practice time on this device
          </label>
        </details>
        <div className="vd-toolbar" style={{ marginTop: 18 }}>
          <button
            disabled={!loaded}
            className="vd-button vd-primary"
            onClick={() => onAction(tasks[0])}
          >
            {practiced >= minutes
              ? "Continue optional practice"
              : "Start today’s practice"}
          </button>
          <button
            className="vd-button"
            onClick={() => onAction({ action: "placement" })}
          >
            Find a vocabulary starting point
          </button>
          <span className="vd-muted">
            {completedToday
              ? `${completedToday} mission${completedToday > 1 ? "s" : ""} completed today`
              : "One useful step is enough to start."}
          </span>
        </div>
        <p className="vd-muted">
          {preferences.trackTime !== false
            ? `${practiced} of ${minutes} active minutes (approx.) · `
            : ""}
          {practiced >= minutes
            ? "Your time goal is met. This is a useful stopping point."
            : "Take a short chapter now; longer lessons can resume later."}
        </p>
        {waiting > 0 && (
          <p className="vd-muted" role="status">
            {waiting} second-look review{waiting > 1 ? "s" : ""} waiting for a
            short gap. They will appear here when ready.
          </p>
        )}
      </section>
      <div className="vd-grid vd-route">
        {tasks.map((task, i) => (
          <section className="vd-panel" key={task.action}>
            <div className="vd-kicker">
              {i + 1} · about {task.minutes} minutes
            </div>
            <h2 style={{ fontSize: "1.35rem" }}>{task.label}</h2>
            <p>{task.why}</p>
            <button
              disabled={!loaded}
              className="vd-button"
              onClick={() => onAction(task)}
            >
              Begin
            </button>
          </section>
        ))}
      </div>
      <section className="vd-panel">
        <h2>Bring a film, show, or podcast</h2>
        <p>
          Open your own video or audio with subtitles. Replay lines, compare two
          subtitle tracks, study phrases, and save what you want to use. Files
          stay in your browser.
        </p>
        <button
          className="vd-button vd-primary"
          onClick={() => onAction({ action: "media" })}
        >
          Open Media Studio
        </button>
      </section>
      <div className="vd-toolbar">
        <button
          className="vd-button"
          onClick={() => onAction({ action: "challenge" })}
        >
          Weekly unseen challenge
        </button>
        <button
          className="vd-button"
          onClick={() => onAction({ action: "passport" })}
        >
          Your skill passport
        </button>
        <button
          className="vd-button"
          onClick={() => onAction({ action: "library" })}
        >
          Browse all practice
        </button>
      </div>
    </div>
  );
}
