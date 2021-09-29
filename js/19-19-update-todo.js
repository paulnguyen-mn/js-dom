function isMatchStatus(liElement, filterStatus) {
  return filterStatus === 'all' || liElement.dataset.status === filterStatus;
}

function isMatchSearch(liElement, searchTerm) {
  if (!liElement) return false;

  // searchTerm === empty --> show all
  // searchTerm != empty --> filter todo
  if (searchTerm === '') return true;

  const titleElement = liElement.querySelector('p.todo__title');
  if (!titleElement) return false;

  return titleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());
}

function isMatch(liElement, params) {
  return (
    isMatchSearch(liElement, params.get('searchTerm')) &&
    isMatchStatus(liElement, params.get('status'))
  );
}

function createTodoElement(todo, params) {
  if (!todo) return null;

  // find template
  const todoTemplate = document.getElementById('todoTemplate');
  if (!todoTemplate) return null;

  // clone li element
  const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
  todoElement.dataset.id = todo.id;
  todoElement.dataset.status = todo.status;

  // render todo status
  const divElement = todoElement.querySelector('div.todo');
  if (!divElement) return null;

  const alertClass = todo.status === 'completed' ? 'alert-success' : 'alert-secondary';
  divElement.classList.remove('alert-secondary');
  divElement.classList.add(alertClass);

  // update content where needed
  const titleElement = todoElement.querySelector('.todo__title');
  if (titleElement) titleElement.textContent = todo.title;

  // check if we should show it or not
  todoElement.hidden = !isMatch(todoElement, params);

  // TODO: attach events for buttons
  // add click event for mark-as-done button
  const markAsDoneButton = todoElement.querySelector('button.mark-as-done');
  if (markAsDoneButton) {
    markAsDoneButton.addEventListener('click', () => {
      const currentStatus = todoElement.dataset.status;
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

      // get current todo list
      // update status of current todo
      // save to local storage
      const todoList = getTodoList();
      const index = todoList.findIndex((x) => x.id === todo.id);
      if (index >= 0) {
        todoList[index].status = newStatus;
        localStorage.setItem('todo_list', JSON.stringify(todoList));
      }

      // update data-status on li element
      todoElement.dataset.status = newStatus;

      // update alert class accordingly
      const newAlertClass = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
      divElement.classList.remove('alert-success', 'alert-secondary');
      divElement.classList.add(newAlertClass);
    });
  }

  // add click event for remove button
  const removeButton = todoElement.querySelector('button.remove');
  if (removeButton) {
    removeButton.addEventListener('click', () => {
      // save to local storage
      const todoList = getTodoList();
      // console.log({ todoList, removeId: todo.id });
      const newTodoList = todoList.filter((x) => x.id !== todo.id);
      localStorage.setItem('todo_list', JSON.stringify(newTodoList));

      // remove from dom
      todoElement.remove();
    });
  }

  // add click event for edit button
  const editButton = todoElement.querySelector('button.edit');
  if (editButton) {
    editButton.addEventListener('click', () => {
      // need to get todo from local storage
      // as todo data can be outdated
      const todoList = getTodoList();
      const latestTodo = todoList.find((x) => x.id === todo.id);
      if (!latestTodo) return;

      // populate data to todo form
      populateTodoForm(latestTodo);
    });
  }

  return todoElement;
}

function populateTodoForm(todo) {
  // query todo form
  // dataset.id = todo.id
  const todoForm = document.getElementById('todoFormId');
  if (!todoForm) return;

  todoForm.dataset.id = todo.id;

  // set values for form controls
  // set todoText input
  const todoInput = document.getElementById('todoText');
  if (todoInput) todoInput.value = todo.title;
}

function renderTodoList(todoList, ulElementId, params) {
  if (!Array.isArray(todoList) || todoList.length === 0) return;

  // find ul element
  // loop through todoList
  // each todo --> create li element --> append to ul
  const ulElement = document.getElementById(ulElementId);
  if (!ulElement) return;

  for (const todo of todoList) {
    const liElement = createTodoElement(todo, params);
    ulElement.appendChild(liElement);
  }
}

function getTodoList() {
  try {
    return JSON.parse(localStorage.getItem('todo_list'));
  } catch {
    return [];
  }
}

function handleTodoFormSubmit(event) {
  event.preventDefault();

  const todoForm = document.getElementById('todoFormId');
  if (!todoForm) return;

  // get form values
  // validate form values
  const todoInput = document.getElementById('todoText');
  if (!todoInput) return;

  // determine add or edit mode
  const isEdit = Boolean(todoForm.dataset.id);

  if (isEdit) {
    // find current todo
    const todoList = getTodoList();
    const index = todoList.findIndex((x) => x.id.toString() === todoForm.dataset.id);
    if (index < 0) return;

    // update content
    todoList[index].title = todoInput.value;

    // save
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // apply DOM changes
    // find li element having id = todoForm.dataset.id
    const liElement = document.querySelector(`ul#todoList > li[data-id="${todoForm.dataset.id}"]`);
    if (liElement) {
      const titleElement = liElement.querySelector('.todo__title');
      if (titleElement) titleElement.textContent = todoInput.value;
    }
  } else {
    // add mode
    const newTodo = {
      id: Date.now(),
      title: todoInput.value,
      status: 'pending',
    };

    // save
    const todoList = getTodoList();
    todoList.push(newTodo);
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // apply DOM changes
    const newLiElement = createTodoElement(newTodo);
    const ulElement = document.getElementById('todoList');
    if (!ulElement) return;
    ulElement.appendChild(newLiElement);
  }

  // reset form
  delete todoForm.dataset.id;
  todoForm.reset();
}

// main
(() => {
  // const todoList = [
  //   { id: 1, title: 'Learn Javascript', status: 'pending' },
  //   { id: 2, title: 'Learn ReactJS', status: 'completed' },
  //   { id: 3, title: 'Learn NextJS', status: 'pending' },
  // ];
  const params = new URLSearchParams(window.location.search);

  const todoList = getTodoList();
  renderTodoList(todoList, 'todoList', params);

  // register submit event for todo form
  const todoForm = document.getElementById('todoFormId');
  if (todoForm) {
    todoForm.addEventListener('submit', handleTodoFormSubmit);
  }
})();
