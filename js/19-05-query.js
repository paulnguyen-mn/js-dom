// main
(() => {
  let channelName = 'Easy Frontend';
  console.log('hello from 19-05', channelName);

  const h1Element = document.getElementById('title');
  console.log('h1', h1Element);

  const liElementList = document.querySelectorAll('#todoList > li');
  if (liElementList) {
    for (const liElement of liElementList) {
      console.log(liElement);
    }
  }
})();
