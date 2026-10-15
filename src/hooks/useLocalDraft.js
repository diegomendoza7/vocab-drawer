import { useEffect, useState } from "react";
function read(key, initial) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? initial;
  } catch {
    return initial;
  }
}
export function useLocalDraft(key, initial = "") {
  const [state, setState] = useState(() => ({
    key,
    value: read(key, initial),
  }));
  const [error, setError] = useState("");
  const value = state.key === key ? state.value : read(key, initial);
  useEffect(() => {
    if (state.key !== key) setState({ key, value: read(key, initial) });
  }, [key, initial, state.key]);
  useEffect(() => {
    if (state.key !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify(state.value));
      setError("");
    } catch {
      setError(
        "This draft cannot be stored on this device. Keep this tab open or save the entry.",
      );
    }
  }, [key, state]);
  function setValue(update) {
    setState((previous) => ({
      key,
      value:
        typeof update === "function"
          ? update(previous.key === key ? previous.value : read(key, initial))
          : update,
    }));
  }
  return [value, setValue, error];
}
