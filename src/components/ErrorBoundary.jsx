import { Component } from "react";
import { C } from "../theme.js";

/* Keep a render error from taking the whole app with it.
 *
 * Without this, any thrown error unmounts everything: a blank white page, no
 * message, and no way back except a manual reload. That has happened twice in
 * this project's history — an undefined constant, and an index running past the
 * end of a batch — and in both cases the app simply vanished mid-lesson.
 *
 * Progress is safe when it does. Scheduling is committed to IndexedDB as it is
 * earned, not at the end of a sitting, so the panel can say so honestly rather
 * than leaving the reader to guess whether their work survived.
 *
 * A class component because that is the only way to catch render errors —
 * there is still no hook equivalent.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // The stack is worth more than the message when this is reported later.
    console.error("[vocab-drawer] render error", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen w-full flex items-start justify-center py-16 px-4"
        style={{ backgroundColor: C.paper, color: C.ink, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="w-full max-w-lg rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, borderLeft: `6px solid ${C.red}` }}>
          <h1 className="font-type text-2xl mb-2" style={{ color: C.ink }}>That screen broke</h1>
          <p className="font-serif text-sm mb-4" style={{ color: C.muted }}>
            Something in the app threw an error and this screen could not finish
            drawing. <strong style={{ color: C.ink }}>Your progress is safe</strong> — reviews are
            saved as you answer them, not at the end of a session.
          </p>

          <pre className="rounded-md p-3 mb-4 text-xs overflow-x-auto" style={{ backgroundColor: C.paper, border: `1px solid ${C.line}`, color: C.red }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>

          <div className="flex gap-2 flex-wrap">
            {/* Clearing the error re-renders the tree that threw. Fine when the
                cause was transient state; the reload is there for when it isn't. */}
            <button
              onClick={() => { this.setState({ error: null }); this.props.onReset?.(); }}
              className="px-4 py-2 rounded-md font-semibold text-sm"
              style={{ backgroundColor: C.gold, color: C.onGold }}
            >
              Back to home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md font-semibold text-sm"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            >
              Reload the app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
