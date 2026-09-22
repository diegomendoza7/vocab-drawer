import { describe, it, expect } from "vitest";
import {
  ACTIVITIES, STRANDS, STRAND_ORDER, recordActivity, strandBalance, neglectedStrand, strandWhy, daysSince,
} from "./strands.js";

const T = "2026-09-20";

describe("the activity record", () => {
  it("counts a day, not a session", () => {
    let a = recordActivity({}, "reading", T);
    a = recordActivity(a, "reading", T);
    a = recordActivity(a, "reading", T);
    expect(a.reading).toMatchObject({ days: 1, last: T, first: T });
  });

  it("counts a second day separately", () => {
    let a = recordActivity({}, "reading", "2026-09-18");
    a = recordActivity(a, "reading", T);
    expect(a.reading).toMatchObject({ days: 2, last: T, first: "2026-09-18" });
  });

  it("ignores a key that is not an activity, rather than inventing one", () => {
    expect(recordActivity({}, "nonsense", T)).toEqual({});
  });

  it("does not mutate what it was given", () => {
    const before = { reading: { last: T, days: 1, first: T } };
    recordActivity(before, "reading", "2026-09-21");
    expect(before.reading.days).toBe(1);
  });
});

describe("every activity is wired to a real strand and section", () => {
  it("names a strand that exists", () => {
    for (const [key, a] of Object.entries(ACTIVITIES)) {
      expect(STRANDS[a.strand], `${key} points at strand ${a.strand}`).toBeTruthy();
      expect(a.section).toBeTruthy();
      expect(a.invite).toBeTruthy();
    }
  });

  it("covers all four strands — a strand with nothing in it could never be done", () => {
    for (const s of STRAND_ORDER) {
      expect(Object.values(ACTIVITIES).some((a) => a.strand === s), `${s} has no activity`).toBe(true);
    }
  });
});

describe("strandBalance", () => {
  it("is all zeros and no shares before anything is done", () => {
    const rows = strandBalance({}, T);
    expect(rows).toHaveLength(4);
    expect(rows.every((r) => r.days === 0 && r.share === 0 && r.since === null)).toBe(true);
  });

  it("adds the days of every activity in a strand", () => {
    let a = recordActivity({}, "reading", "2026-09-18");
    a = recordActivity(a, "dictation", "2026-09-19");
    a = recordActivity(a, "import", T);
    const input = strandBalance(a, T).find((r) => r.strand === "input");
    expect(input.days).toBe(3);
    expect(input.last).toBe(T);
    expect(input.since).toBe(0);
    expect(input.share).toBe(1);
  });

  it("shares out across strands", () => {
    let a = recordActivity({}, "study", T);
    a = recordActivity(a, "reading", T);
    const rows = strandBalance(a, T);
    expect(rows.find((r) => r.strand === "form").share).toBeCloseTo(0.5);
    expect(rows.find((r) => r.strand === "input").share).toBeCloseTo(0.5);
  });
});

describe("neglectedStrand", () => {
  it("prefers a strand never touched over one merely stale", () => {
    /* Reading nine days ago, nothing else ever. Input is stale; output,
     * fluency and study have never happened at all. */
    const a = recordActivity({}, "reading", "2026-09-11");
    const gap = neglectedStrand(a, T);
    expect(gap.never).toBe(true);
    expect(gap.strand).not.toBe("input");
  });

  it("names the stalest strand once all four have been done", () => {
    let a = recordActivity({}, "reading", "2026-09-01");   // input: 19 days
    a = recordActivity(a, "writing", "2026-09-18");         // output: 2 days
    a = recordActivity(a, "study", "2026-09-19");           // form: 1 day
    a = recordActivity(a, "fluency", "2026-09-15");         // fluency: 5 days
    const gap = neglectedStrand(a, T);
    expect(gap.strand).toBe("input");
    expect(gap.days).toBe(19);
  });

  it("says nothing when every strand is fresh — there is no gap to name", () => {
    let a = recordActivity({}, "reading", T);
    a = recordActivity(a, "writing", T);
    a = recordActivity(a, "study", T);
    a = recordActivity(a, "fluency", T);
    expect(neglectedStrand(a, T)).toBe(null);
  });

  it("holds off until a strand has actually gone stale", () => {
    let a = recordActivity({}, "reading", "2026-09-19");
    a = recordActivity(a, "writing", "2026-09-19");
    a = recordActivity(a, "study", "2026-09-19");
    a = recordActivity(a, "fluency", "2026-09-19");
    expect(neglectedStrand(a, T)).toBe(null);          // one day is not neglect
    expect(neglectedStrand(a, "2026-09-23")).toBeTruthy(); // four days is
  });

  it("picks the untried activity inside the strand ahead of the stale one", () => {
    /* Reading done long ago, dictation never. The input suggestion should be
     * the part of the app with no path to it, not the part already found. */
    const a = recordActivity({}, "reading", "2026-09-01");
    const gap = neglectedStrand(a, T, { available: new Set(["reading", "dictation", "import"]) });
    expect(gap.strand).toBe("input");
    expect(["dictation", "import"]).toContain(gap.activity);
  });

  it("never recommends work the caller says is unavailable", () => {
    const available = new Set(["study", "reading", "writing"]);
    for (let i = 0; i < 12; i += 1) {
      const gap = neglectedStrand({}, T, { available });
      expect(available.has(gap.activity)).toBe(true);
    }
  });

  it("returns nothing when nothing at all is available", () => {
    expect(neglectedStrand({}, T, { available: new Set() })).toBe(null);
  });

  it("routes to a section the rail actually has", () => {
    const gap = neglectedStrand({}, T);
    expect(gap.section).toBe(ACTIVITIES[gap.activity].section);
  });
});

describe("strandWhy", () => {
  it("says never rather than a day count when it has never been done", () => {
    expect(strandWhy({ strand: "input", never: true, days: null })).toMatch(/not tried this yet/);
  });

  it("counts days in the singular", () => {
    expect(strandWhy({ strand: "output", never: false, days: 1 })).toMatch(/A day since/);
  });

  it("is empty for no gap, so the caller can render it unconditionally", () => {
    expect(strandWhy(null)).toBe("");
  });
});

describe("daysSince", () => {
  it("is null for never", () => expect(daysSince(null, T)).toBe(null));
  it("is 0 for today", () => expect(daysSince(T, T)).toBe(0));
  it("never goes negative for a date in the future", () => expect(daysSince("2026-09-25", T)).toBe(0));
});
