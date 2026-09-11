/** Insert `ch` at the cursor of a textarea, keeping the caret after it. */
export function insertAt(ref, value, setValue, ch) {
  const el = ref.current;
  if (!el) { setValue(value + ch); return; }
  const s = el.selectionStart ?? value.length;
  const e = el.selectionEnd ?? value.length;
  setValue(value.slice(0, s) + ch + value.slice(e));
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(s + ch.length, s + ch.length);
  });
}
