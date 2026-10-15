export function fitDailyRoute(tasks, minutes) {
  const budget = Math.max(5, Math.min(30, Number(minutes) || 15));
  const count = Math.min(tasks.length, budget < 10 ? 2 : budget < 15 ? 3 : 4);
  const chosen = tasks.slice(0, count);
  const share = Math.floor(budget / count),
    extra = budget % count;
  return chosen.map((task, i) => ({
    ...task,
    minutes: share + (i < extra ? 1 : 0),
  }));
}
