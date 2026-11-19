(function (root) {
  function parseTasks(source) {
    const tasks = new Map();
    for (const line of source.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length !== 3 || !parts[0]) throw new Error("Use: name | minutes | prerequisite names");
      if (tasks.has(parts[0])) throw new Error("Task names must be unique");
      const minutes = Number(parts[1]);
      if (!Number.isInteger(minutes) || minutes <= 0) throw new Error("Minutes must be positive whole numbers");
      const prerequisites = parts[2] ? parts[2].split(",").map((part) => part.trim()).filter(Boolean) : [];
      tasks.set(parts[0], { minutes, prerequisites });
    }
    if (!tasks.size || tasks.size > 16) throw new Error("Enter 1 to 16 tasks");
    const total = [...tasks.values()].reduce((sum, task) => sum + task.minutes, 0);
    if (total > 1440) throw new Error("Total time must be 1,440 minutes or less");
    return tasks;
  }

  function revise(tasks, budget) {
    if (!Number.isInteger(budget) || budget < 0) throw new Error("Available time must be a nonnegative whole number");
    const order = [];
    const visiting = new Set();
    const visited = new Set();
    function visit(name) {
      if (visiting.has(name)) throw new Error("Prerequisites contain a cycle");
      if (visited.has(name)) return;
      if (!tasks.has(name)) throw new Error(`Unknown prerequisite: ${name}`);
      visiting.add(name);
      for (const prerequisite of tasks.get(name).prerequisites) visit(prerequisite);
      visiting.delete(name);
      visited.add(name);
      order.push(name);
    }
    for (const name of tasks.keys()) visit(name);

    const names = [...tasks.keys()];
    for (let count = names.length; count >= 0; count -= 1) {
      let best = null;
      function choose(start, selected) {
        if (best) return;
        if (selected.length === count) {
          const chosen = new Set(selected);
          const minutes = selected.reduce((sum, name) => sum + tasks.get(name).minutes, 0);
          if (minutes <= budget && selected.every((name) =>
            tasks.get(name).prerequisites.every((parent) => chosen.has(parent)))) {
            best = selected.slice();
          }
          return;
        }
        const needed = count - selected.length;
        for (let index = start; index <= names.length - needed; index += 1) {
          selected.push(names[index]);
          choose(index + 1, selected);
          selected.pop();
          if (best) return;
        }
      }
      choose(0, []);
      if (best) {
        const chosen = new Set(best);
        return {
          selected: order.filter((name) => chosen.has(name)),
          deferred: names.filter((name) => !chosen.has(name)),
        };
      }
    }
  }

  const api = { parseTasks, revise };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.StudyPlan = api;
})(typeof window === "undefined" ? globalThis : window);
