document.addEventListener('DOMContentLoaded', async function() {
  function fetchPosts() {
    return fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(json => json)
  }
  
  function renderPosts(posts) {
    $posts.innerHTML = '';
    posts.forEach((post) => {
      let post_card = `
      <li class="card" id="${post.id}">
        <div class="title">${post.title}</div>
        <div class="body">
          ${post.body}
        </div>
      </li>`;
      $posts.insertAdjacentHTML('beforeend', post_card);
    })
  }

  let posts = await fetchPosts();
  const $posts = document.querySelector('.posts');
  renderPosts(posts);

  function onSearch(e) {
    let value = e.target.value.trim().split(' ');
    let searchResult = posts;

    if (value.length) {
      for (let word of value) {
        searchResult = searchResult.filter((post) => {
          return post.title.includes(word) || post.body.includes(word);
        })  
      }
    }

    renderPosts(searchResult);

    items = Array.from($posts.getElementsByTagName('li')).slice(0)

    createPageButtons();
    showPage(currentPage)
  }

  const $search = document.querySelector('.search');
  $search.addEventListener('keyup', onSearch)

  const itemsPerPage = 8;
  let currentPage = 0;
  let items = Array.from($posts.getElementsByTagName('li')).slice(0)

  function showPage(page) {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    items.forEach((item, idx) => {
      item.classList.toggle('hidden', idx < startIndex || idx >= endIndex);
    })
    updateActiveButtonStates();
  }

  function createPageButtons(){
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const $paginationContainer = document.createElement('div');
    $paginationContainer.classList.add('pagination');
    const $paginationDiv = document.body.appendChild($paginationContainer);

    for (let i = 0; i < totalPages; i++) {
      const $pageButton = document.createElement('button');
      $pageButton.textContent = i + 1;
      $pageButton.addEventListener('click', () => {
        currentPage = i;
        showPage(currentPage);
        updateActiveButtonStates();
      })
      $posts.appendChild($paginationContainer);
      $paginationDiv.appendChild($pageButton);
    }
  }

  function updateActiveButtonStates() {
    const pageButtons = document.querySelectorAll('.pagination button');
    pageButtons.forEach((button, index) => {
      if (index === currentPage) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    })
  }

  createPageButtons();
  showPage(currentPage)
})