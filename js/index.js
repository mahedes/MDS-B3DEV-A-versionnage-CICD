const input = document.querySelector(".new-todo");
const list = document.querySelector(".todo-list");
const counter = document.querySelector(".todo-count");

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const task = input.value.trim();
    if (task === "") return;
    const li = document.createElement("li");
    li.textContent = task;
    list.appendChild(li);

    input.value = "";
    updateCount();
  }
});

function updateCount() {
  const items = document.querySelectorAll(".todo-list li").length;
  counter.textContent = `${items} item${items !== 1 ? "s" : ""} left`;
}
 