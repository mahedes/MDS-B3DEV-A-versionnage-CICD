const input = document.querySelector(".new-todo");
const list = document.querySelector(".todo-list");
const counter = document.querySelector(".todo-count");

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const task = input.value.trim();
    if (task === "") return;
  const li = document.createElement("li");
  // Texte de la tâche
  const textSpan = document.createElement("span");
  textSpan.textContent = task;
  // Date de création
  const dateSpan = document.createElement("span");
  dateSpan.className = "task-date";
  const now = new Date();
  dateSpan.textContent = now.toLocaleDateString() + " " + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  // Ajout au li
  li.appendChild(textSpan);
  li.appendChild(dateSpan);
  list.appendChild(li);

  input.value = "";
  updateCount();
  }
});

function updateCount() {
  const items = document.querySelectorAll(".todo-list li").length;
  counter.textContent = `${items} item${items !== 1 ? "s" : ""} left`;
}
