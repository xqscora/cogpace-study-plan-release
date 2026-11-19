const EXAMPLE = [
  "Read the worked example | 15 |",
  "Take the practice quiz | 20 | Read the worked example",
  "Review flashcards | 10 |",
].join("\n");

const input = document.querySelector("#task-input");
const slider = document.querySelector("#budget");
const status = document.querySelector("#status");
const error = document.querySelector("#error");
let currentPlan = [];
let proposedPlan = [];
let lastSource = null;

function addTask(list, tasks, name, kind) {
  const item = document.createElement("li");
  item.className = "task-row";
  const title = document.createElement("span");
  title.className = "task-name";
  title.textContent = name;
  const minutes = document.createElement("span");
  minutes.className = "task-minutes";
  minutes.textContent = `${tasks.get(name).minutes} min`;
  item.append(title, minutes);
  if (kind === "deferred") {
    const missing = tasks.get(name).prerequisites.filter((parent) => !proposedPlan.includes(parent));
    const note = document.createElement("small");
    note.className = "task-reason";
    note.textContent = missing.length ? `Waiting on: ${missing.join(", ")}` : "Does not fit this time budget";
    item.append(note);
  }
  list.append(item);
}

function render() {
  error.hidden = true;
  try {
    const tasks = StudyPlan.parseTasks(input.value);
    if (input.value !== lastSource) {
      currentPlan = StudyPlan.revise(tasks, [...tasks.values()].reduce((sum, task) => sum + task.minutes, 0)).selected;
      lastSource = input.value;
    }
    const total = [...tasks.values()].reduce((sum, task) => sum + task.minutes, 0);
    slider.max = String(total);
    if (Number(slider.value) > total) slider.value = String(total);
    const budget = Number(slider.value);
    const result = StudyPlan.revise(tasks, budget);
    proposedPlan = result.selected;

    document.querySelector("#budget-output").textContent = `${budget} min`;
    document.querySelector("#total-label").textContent = `${total} min total`;
    const currentMinutes = currentPlan.reduce((sum, name) => sum + tasks.get(name).minutes, 0);
    const proposedMinutes = proposedPlan.reduce((sum, name) => sum + tasks.get(name).minutes, 0);
    document.querySelector("#current-total").textContent = String(currentMinutes);
    document.querySelector("#proposed-total").textContent = String(proposedMinutes);

    const currentList = document.querySelector("#current-list");
    const proposedList = document.querySelector("#proposed-list");
    const deferredList = document.querySelector("#deferred-list");
    currentList.replaceChildren();
    proposedList.replaceChildren();
    deferredList.replaceChildren();
    currentPlan.forEach((name) => addTask(currentList, tasks, name, "current"));
    proposedPlan.forEach((name) => addTask(proposedList, tasks, name, "proposed"));
    result.deferred.forEach((name) => addTask(deferredList, tasks, name, "deferred"));
    document.querySelector("#deferred-count").textContent = String(result.deferred.length);
    document.querySelector("#deferred-section").hidden = result.deferred.length === 0;
    document.querySelector("#adopt").disabled = currentPlan.join("\0") === proposedPlan.join("\0");
    status.textContent = "Local only";
  } catch (problem) {
    error.textContent = problem.message;
    error.hidden = false;
    status.textContent = "Review task input";
    document.querySelector("#adopt").disabled = true;
  }
}

input.value = EXAMPLE;
input.addEventListener("input", render);
slider.addEventListener("input", render);
document.querySelector("#reset").addEventListener("click", () => {
  input.value = EXAMPLE;
  currentPlan = [];
  slider.value = "25";
  render();
});
document.querySelector("#adopt").addEventListener("click", () => {
  currentPlan = [...proposedPlan];
  status.textContent = "Plan adopted";
  render();
  status.textContent = "Plan adopted";
});
render();
