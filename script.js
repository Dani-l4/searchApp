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
      <li class="card" id="${post.id}" data-id="${post.id}" data-title="${post.title}" data-body="${post.body}">
        <div class="card__title">${post.title}</div>
        <div class="card__body">
          ${post.body}
        </div>
      </li>`;
      $posts.insertAdjacentHTML('beforeend', post_card);
    })

    items = Array.from($posts.getElementsByTagName('li'))
    setCardsClickEvent();

    createPageButtons();
    showPage(currentPage)
  }

  let posts = await fetchPosts();
  const $posts = document.querySelector('.posts');
  const itemsPerPage = 8;
  let currentPage = 0;
  let items

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
  }

  const $search = document.querySelector('.search');
  $search.addEventListener('keyup', onSearch)

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

  // MODAL ==================

  const $modal = document.getElementById('modal');
  const $form = document.querySelector('.form');

  function openModal() {
    document.body.classList.add('lock');
    $modal.classList.add('open');
  }
  
  function closeModal() {
    document.body.classList.remove('lock');
    $modal.classList.remove('open');
    $form.reset();
  }

  $modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('form__close_btn') || e.target.classList.contains('modal__body')) {
      closeModal()
    }
  });
  
  document.addEventListener('keydown', function(e) { 
    if (e.key === 'Escape') {
      closeModal()
    }
  })

  function setCardsClickEvent() {
    for (let item of items){
      item.addEventListener('click', editPost)
    }
  }

  function editPost(e) {
    const card = this;
    const $postId = $form.elements['post_id'];
    const $postTitle = $form.elements['post_title'];
    const $postBody = $form.elements['post_body'];

    $postId.setAttribute('value', card.dataset.id);
    $postTitle.setAttribute('value', card.dataset.title);
    $postBody.value = card.dataset.body;
  
    $postBody.style.height = $postBody.scrollHeight + 'px';
  
    openModal()
  
    e.preventDefault()
  }

  // UD (Update Delete)

  const $update_btn = document.querySelector('.form__submit_btn');
  const $delete_btn = document.querySelector('.form__delete_btn');

  $update_btn.addEventListener('click', function () {
    const postId = $form.elements.post_id.value;
    const postTitle = $form.elements.post_title.value;
    const postBody = $form.elements.post_body.value;

    closeModal();

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: postTitle,
        body: postBody,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then(res => res.json())
    .then(patchedPost => {
      const patchedPostIndex = posts.findIndex((post) => post.id === patchedPost.id);
      posts[patchedPostIndex] = patchedPost;
      renderPosts(posts);
    });
  })
  
  $delete_btn.addEventListener('click', function() {
    const postId = $form.elements.post_id.value;

    closeModal();

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if(res.ok) {
          const deletedPostIndex = posts.findIndex((post) => post.id == postId);
          posts.splice(deletedPostIndex, 1);
          renderPosts(posts);
        } else {
          console.log('Something went wrong :(');
        }
      })
  })
  
})