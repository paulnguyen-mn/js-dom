function getAllTodoElements() {
  return document.querySelectorAll('#todoList > li');
}

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

function initSearchInput(params) {
  // find search term input
  const searchInput = document.getElementById('searchTerm');
  if (!searchInput) return;

  if (params.get('searchTerm')) {
    searchInput.value = params.get('searchTerm');
  }
  // attach change event
  searchInput.addEventListener('input', () => {
    handleFilterChange('searchTerm', searchInput.value);
  });
}

function handleFilterChange(filterName, filterValue) {
  // update query params
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, '', url);

  const todoElementList = getAllTodoElements();
  for (const todoElement of todoElementList) {
    const needToShow = isMatch(todoElement, url.searchParams);
    todoElement.hidden = !needToShow;
  }
}

function initFilterStatus(params) {
  // find select
  const filterStatusSelect = document.getElementById('filterStatus');
  if (!filterStatusSelect) return;

  if (params.get('status')) {
    filterStatusSelect.value = params.get('status');
  }

  // attach event change
  filterStatusSelect.addEventListener('change', () => {
    handleFilterChange('status', filterStatusSelect.value);
  });
}

// MAIN
(() => {
  // get query params object
  const params = new URLSearchParams(window.location.search);
  initSearchInput(params);
  initFilterStatus(params);
})();
