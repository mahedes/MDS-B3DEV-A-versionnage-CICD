const input = document.querySelector(".new-todo");
const list = document.querySelector(".todo-list"); // <ul> cible
const counter = document.querySelector(".todo-count");

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const task = input.value.trim();
    if (task === "") return;

    const li = document.createElement("li");

    // Ajout de la case à cocher
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("toggle");
    checkbox.addEventListener("change", () => {
      li.classList.toggle("completed", checkbox.checked);
      updateCount();
      applyFilter();
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = task;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    deleteBtn.classList.add("destroy");
    deleteBtn.addEventListener("click", () => {
      li.remove();
      updateCount();
      applyFilter();
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    list.appendChild(li);

    input.value = "";
    updateCount();
    applyFilter();
  }
});

function updateCount() {
  const items = document.querySelectorAll(".todo-list li:not(.completed)").length;
  counter.textContent = `${items} item${items !== 1 ? "s" : ""} left`;
}

// Filtrage des tâches selon le hash
function applyFilter() {
  const hash = window.location.hash;
  document.querySelectorAll(".todo-list li").forEach(li => {
    if (hash === "#/completed") {
      li.style.display = li.classList.contains("completed") ? "" : "none";
    } else if (hash === "#/active") {
      li.style.display = !li.classList.contains("completed") ? "" : "none";
    } else {
      li.style.display = "";
    }
  });
}

window.addEventListener("hashchange", applyFilter);
g