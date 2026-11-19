const test = require("node:test");
const assert = require("node:assert/strict");
const { parseTasks, revise } = require("./planner.js");

test("example preserves the prerequisite and defers the quiz", () => {
  const tasks = parseTasks([
    "Read example | 15 |",
    "Practice quiz | 20 | Read example",
    "Flashcards | 10 |",
  ].join("\n"));
  assert.deepEqual(revise(tasks, 25), {
    selected: ["Read example", "Flashcards"],
    deferred: ["Practice quiz"],
  });
});

test("ties follow the user's input preference", () => {
  const tasks = parseTasks("First | 5 |\nSecond | 5 |");
  assert.deepEqual(revise(tasks, 5).selected, ["First"]);
});

test("unknown prerequisites and cycles are rejected", () => {
  assert.throws(() => revise(parseTasks("A | 5 | Missing"), 5), /Unknown prerequisite/);
  assert.throws(() => revise(parseTasks("A | 5 | B\nB | 5 | A"), 10), /cycle/);
});

test("invalid line formats, duplicate names, and invalid durations are rejected", () => {
  assert.throws(() => parseTasks("A | 5"), /Use:/);
  assert.throws(() => parseTasks("A | 5 |\nA | 10 |"), /unique/);
  assert.throws(() => parseTasks("A | 0 |"), /positive whole numbers/);
});

test("task and time bounds are enforced", () => {
  assert.throws(() => parseTasks(""), /1 to 16/);
  assert.throws(() => parseTasks(Array.from({ length: 17 }, (_, i) => `T${i} | 1 |`).join("\n")), /1 to 16/);
  assert.throws(() => revise(parseTasks("A | 5 |"), -1), /nonnegative/);
});
