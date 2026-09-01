import { useState } from "react";
import VocabDrawer from "./VocabDrawer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function App() {
  /* Remounting VocabDrawer is what "back to home" means here: the boundary can
   * clear its own error, but the component that threw keeps whatever state
   * caused it until it is rebuilt from scratch. Persisted progress reloads from
   * IndexedDB, so the remount costs nothing but the current screen. */
  const [runId, setRunId] = useState(0);

  return (
    <ErrorBoundary onReset={() => setRunId((n) => n + 1)}>
      <VocabDrawer key={runId} />
    </ErrorBoundary>
  );
}
