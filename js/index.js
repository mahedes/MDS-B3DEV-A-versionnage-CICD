const input = document.querySelector(".new-todo");
const list = document.querySelector(".todo-list"); // <ul> cible
const counter = document.querySelector(".todo-count");

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const task = input.value.trim();
    if (task === "") return;

    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = task;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    deleteBtn.classList.add("destroy");
    deleteBtn.addEventListener("click", () => {
      li.remove();
      updateCount();
    });

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    list.appendChild(li);

    input.value = "";
    updateCount();
  }
});

function updateCount() {
  const items = document.querySelectorAll(".todo-list li").length;
  counter.textContent = `${items} item${items !== 1 ? "s" : ""} left`;
}
