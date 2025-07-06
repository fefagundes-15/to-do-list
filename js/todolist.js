(function () {
  "use strict";

  // Armazenar o DOM em variáveis
  const itemInput = document.getElementById("item-input");
  const todoAddForm = document.getElementById("todo-add");
  const ul = document.getElementById("todo-list");
  const lis = ul.getElementsByTagName("li"); // É atualizada em tempo real conforme adiciona ou remove li's, diferentemente do querySelectorAll que não é vivo

  let arrTasks = getSavedData();

  //   function addEventLi(li) {
  //     li.addEventListener("click", function () {
  //       console.log(this);
  //     });
  //   }

  function getSavedData() {
    let tasksData = localStorage.getItem("tasks");
    tasksData = JSON.parse(tasksData);
    return tasksData && tasksData.length
      ? tasksData
      : [
          {
            name: "Task 1",
            createAt: Date.now(),
            completed: true,
          },
          {
            name: "Task 2",
            createAt: Date.now(),
            completed: false,
          },
        ];
  }

  function setNewData() {
    localStorage.setItem("tasks", JSON.stringify(arrTasks));
  }

  setNewData();

  function generateLiTask(obj) {
    const li = document.createElement("li"); // Cria uma li
    const p = document.createElement("p"); // Cria um p
    const checkButton = document.createElement("button"); // Cria um botão
    const editButton = document.createElement("i");
    const deleteButton = document.createElement("i");

    li.className = "todo-item"; // Adiciona a classe nela

    checkButton.className = "button-check"; // Adiciona a classe nele
    checkButton.innerHTML = `
        <i class="fas fa-check ${
          obj.completed ? "" : "displayNone"
        }" data-action="checkButton"></i>
        `;
    checkButton.setAttribute("data-action", "checkButton");
    li.appendChild(checkButton); // Seta o p como filho da li

    p.className = "task-name"; // Adiciona a classe nele
    p.textContent = obj.name; // Adiciona o texto no p
    if (obj.completed) {
      p.classList.add("check-p");
    } else {
      p.classList.remove("check-p");
    }
    li.appendChild(p); // Seta o p como filho da li

    editButton.className = "fas fa-edit"; // Adiciona a classe nele
    editButton.setAttribute("data-action", "editButton");
    li.appendChild(editButton); // Seta o p como filho da li

    // Edit container
    const containerEdit = document.createElement("div");
    containerEdit.className = "editContainer";
    const inputEdit = document.createElement("input");
    inputEdit.setAttribute("type", "text");
    inputEdit.className = "editInput";
    inputEdit.setAttribute("name", "text");
    inputEdit.value = obj.name;
    containerEdit.appendChild(inputEdit);
    const containerEditButton = document.createElement("button");
    containerEditButton.className = "editButton";
    containerEditButton.setAttribute("data-action", "containerEditButton");
    containerEditButton.textContent = "Save";
    containerEdit.appendChild(containerEditButton);
    const containerCancelButton = document.createElement("button");
    containerCancelButton.className = "cancelButton";
    containerCancelButton.textContent = "Cancel";
    containerCancelButton.setAttribute("data-action", "containerCancelButton");
    containerEdit.appendChild(containerCancelButton);
    li.appendChild(containerEdit);

    deleteButton.classList.add("fas", "fa-trash-alt"); // Adiciona a classe nele
    deleteButton.setAttribute("data-action", "deleteButton");
    li.appendChild(deleteButton); // Seta o p como filho da li

    // addEventLi(li);

    // Confirm delete container
    const confirmDeleteContainer = document.createElement("div");
    confirmDeleteContainer.className = "confirmDeleteContainer hideConfirmBox";
    confirmDeleteContainer.innerHTML = `
      <span>Excluir tarefa?</span>
      <div class="button-group">
        <button class="btn-confirm" data-action="confirmDeleteYes">Sim</button>
        <button class="btn-cancel" data-action="confirmDeleteNo">Não</button>
      </div>
    `;

    li.appendChild(confirmDeleteContainer);

    // Confirm cancel container
    const confirmCancelContainer = document.createElement("div");
    confirmCancelContainer.className = "confirmCancelContainer hideConfirmBox";
    confirmCancelContainer.innerHTML = `
      <span>Cancelar alterações?</span>
      <div class="button-group">
        <button class="btn-confirm" data-action="confirmCancelYes">Sim</button>
        <button class="btn-cancel" data-action="confirmCancelNo">Não</button>
      </div>
    `;
    li.appendChild(confirmCancelContainer);

    return li;
  }

  function renderTasks() {
    ul.innerHTML = "";
    arrTasks.forEach((task) => {
      ul.appendChild(generateLiTask(task)); // Seta a li como filho da ul
    });
  }

  function addTask(task) {
    arrTasks.push({
      name: task,
      createAt: Date.now(),
      completed: false,
    });

    setNewData();
  }

  function clickedUl(e) {
    const dataAction = e.target.getAttribute("data-action");

    if (!dataAction) return; // Se não tiver dataAction, sai da função

    let currentLi = e.target;
    while (currentLi.nodeName !== "LI") {
      currentLi = currentLi.parentElement;
    }

    const currentLiIndex = [...lis].indexOf(currentLi);

    const actions = {
      editButton: function () {
        const editContainer = currentLi.querySelector(".editContainer");
        [...ul.querySelectorAll(".editContainer")].forEach((container) => {
          container.removeAttribute("style");
        });
        [...ul.querySelectorAll(".confirmDeleteContainer")].forEach((box) => {
          box.style.display = "none";
        });

        editContainer.style.display = "flex";
      },
      deleteButton: function () {
        const confirmBox = currentLi.querySelector(".confirmDeleteContainer");
        [...ul.querySelectorAll(".confirmDeleteContainer")].forEach((box) => {
          box.style.display = "none";
        });
        [...ul.querySelectorAll(".editContainer")].forEach((box) => {
          box.style.display = "none";
        });

        confirmBox.style.display = "block";
      },
      confirmDeleteYes: function () {
        arrTasks.splice(currentLiIndex, 1);
        setNewData();
        renderTasks();
      },
      confirmDeleteNo: function () {
        const confirmBox = currentLi.querySelector(".confirmDeleteContainer");
        confirmBox.style.display = "none";
      },
      containerEditButton: function () {
        const val = currentLi.querySelector(".editInput").value;
        arrTasks[currentLiIndex].name = val;
        renderTasks();
        setNewData();
      },
      containerCancelButton: function () {
        const cancelBox = currentLi.querySelector(".confirmCancelContainer");
        currentLi.querySelector(".editContainer").removeAttribute("style");
        currentLi.querySelector(".editInput").value =
          arrTasks[currentLiIndex].name;

        cancelBox.style.display = "block";
      },
      confirmCancelYes: function () {
        // Apenas fecha a edição, já foi desfeita antes
        renderTasks();
      },

      confirmCancelNo: function () {
        // Volta para o modo de edição
        currentLi.querySelector(".editContainer").style.display = "flex";
        currentLi.querySelector(".confirmCancelContainer").style.display =
          "none";
      },
      checkButton: function () {
        arrTasks[currentLiIndex].completed =
          !arrTasks[currentLiIndex].completed;

        if (arrTasks[currentLiIndex].completed) {
          currentLi.querySelector(".fa-check").classList.remove("displayNone");
        } else {
          currentLi.querySelector(".fa-check").classList.add("displayNone");
        }

        setNewData();
        renderTasks();
      },
    };

    if (actions[dataAction]) {
      actions[dataAction]();
    }
  }

  todoAddForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Evita o comportamento padrão. Nesse caso evita que envie o formulário para fins de customização do botão

    const inputValue = itemInput.value.trim();
    const errorMsg = document.getElementById("input-error");

    if (inputValue === "") {
      errorMsg.classList.add("show");
      return;
    } else {
      errorMsg.classList.remove("show");
    }

    addTask(inputValue);
    renderTasks();
    itemInput.value = "";
    itemInput.focus();
  });

  ul.addEventListener("click", clickedUl);

  setNewData();
  renderTasks();
})();
