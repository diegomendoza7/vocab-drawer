export default function ProgressStatus({ status, onRetry, recovered = 0 }) {
  if (status === "failed")
    return (
      <div role="alert" className="vd-notice vd-error">
        Progress could not be saved. Your work is still available in this tab.
        Export a backup before closing it.{" "}
        <button onClick={onRetry}>Retry saving</button>
      </div>
    );
  return (
    <div role="status" aria-live="polite" className="vd-save-status">
      {status === "loading"
        ? "Loading saved progress…"
        : status === "saving"
          ? "Saving progress…"
          : "All changes saved"}
      {recovered > 0
        ? ` · Recovered ${recovered} answered cards from an interrupted session.`
        : ""}
    </div>
  );
}
