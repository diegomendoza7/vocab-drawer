import { useEffect, useRef } from "react";
import { ACTIVITIES, recordActivity } from "../lib/strands.js";
import { todayKey } from "../lib/srs.js";

export function usePracticeTime({
  lang,
  activity,
  loaded,
  setProgress,
  enabled = true,
}) {
  const update = useRef(setProgress);
  update.current = setProgress;
  const activeAt = useRef(Date.now());
  useEffect(() => {
    const active = () => {
      activeAt.current = Date.now();
    };
    for (const event of ["pointerdown", "keydown", "scroll"])
      window.addEventListener(event, active, { passive: true });
    let previous = Date.now();
    const timer = setInterval(() => {
      const now = Date.now(),
        seconds = Math.min(15, Math.max(0, (now - previous) / 1000));
      previous = now;
      const playing = [...document.querySelectorAll("audio, video")].some(
        (media) => !media.paused && !media.ended && media.readyState >= 2,
      );
      if (
        !enabled ||
        !loaded ||
        !ACTIVITIES[activity] ||
        document.visibilityState !== "visible" ||
        (!playing && now - activeAt.current > 90000)
      )
        return;
      const day = todayKey(),
        strand = ACTIVITIES[activity].strand;
      update.current((p) => ({
        ...p,
        activity: recordActivity(p.activity, `${lang}:${activity}`, day),
        practiceTime: {
          ...p.practiceTime,
          [lang]: {
            ...p.practiceTime?.[lang],
            [day]: {
              ...p.practiceTime?.[lang]?.[day],
              [strand]:
                (p.practiceTime?.[lang]?.[day]?.[strand] || 0) + seconds,
            },
          },
        },
      }));
    }, 15000);
    return () => {
      clearInterval(timer);
      for (const event of ["pointerdown", "keydown", "scroll"])
        window.removeEventListener(event, active);
    };
  }, [lang, activity, loaded, enabled]);
}
