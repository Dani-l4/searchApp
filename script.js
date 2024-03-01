// $varialbe - означает DOM ноду, HTML элемент

document.addEventListener('DOMContentLoaded', async function() {
  function fetchPosts() {
    return fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(json => json)
  }
  
  function renderPosts(posts) {
    // очищаем список, удаляя прошлые посты
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
    // переназначаем глобальную переменную только что добавленными карточками
    cards = Array.from($posts.getElementsByTagName('li'))
    // вешаем на карточки обрабочтик
    setCardsClickEvent();

    // создаём кнопки и показываем нужную страницу
    createPageButtons();
    showPage(currentPage)
  }

  // получаем список постов с сервера
  let posts = await fetchPosts();
  // ul html-element
  const $posts = document.querySelector('.posts');
  const cardsPerPage = 8;
  let currentPage = 0;
  // список всех карточек (li) в списке. Глобальная переменная
  let cards

  renderPosts(posts);

  // обработчик поиска
  function onSearch(e) {
    // разбиваем значение в массив
    let value = e.target.value.trim().split(' ');
    let searchResult = posts;

    if (value.length) {
      // каждый раз сужая список карточек, попавших под поиск "пословно"
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

  // *вся пагинация написана по гайду https://www.dev-notes.ru/articles/frontend/simple-pagination-html-css-javascript/
  // отображение выбранной страницы
  function showPage(page) {
    const startIndex = page * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    cards.forEach((card, idx) => {
      card.classList.toggle('hidden', idx < startIndex || idx >= endIndex);
    })
    updateActiveButtonStates();
  }

  function createPageButtons(){
    const totalPages = Math.ceil(cards.length / cardsPerPage);
    const $paginationContainer = document.createElement('div');
    $paginationContainer.classList.add('pagination');
    const $paginationDiv = document.body.appendChild($paginationContainer); // ??

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
  const $postId = $form.elements['post_id'];
  const $postTitle = $form.elements['post_title'];
  const $postBody = $form.elements['post_body'];

  function openModal() {
    document.body.classList.add('lock');
    $modal.classList.add('open');
  }
  
  function closeModal() {
    document.body.classList.remove('lock');
    $modal.classList.remove('open');
    // очищаем поля при закрытии
    $form.reset();
  }

  // обработчик для закрытия формы
  $modal.addEventListener('click', (e) => {
    // Если кликнули по элементу с указанным классом, то закрыть
    if (e.target.classList.contains('form__close_btn') || e.target.classList.contains('modal__body')) {
      closeModal()
    }
  });
  
  // закрыть модалку при нажатии Escape
  document.addEventListener('keydown', function(e) { 
    if (e.key === 'Escape') {
      closeModal()
    }
  })

  // обработчик клика по карточке (посту)
  // вызывает форму редактирования
  function editPost() {
    const card = this;
    // форма одна на все посты
    // при открытии в инпуты вставляем контент карточки
    $postId.setAttribute('value', card.dataset.id);
    $postTitle.setAttribute('value', card.dataset.title);
    $postBody.value = card.dataset.body;
    
    // высота равна высоте контента
    $postBody.style.height = $postBody.scrollHeight + 'px';
    
    openModal()
  
    e.preventDefault()
  }

  // на готовый список постов (карточек) вешаем обработчик клика
  function setCardsClickEvent() {
    for (let card of cards){
      card.addEventListener('click', editPost)
    }
  }

  // UD (Update Delete)

  const $update_btn = document.querySelector('.form__submit_btn');
  const $delete_btn = document.querySelector('.form__delete_btn');

  $update_btn.addEventListener('click', function () {
    // получаем значение полей формы
    const postId = $form.elements.post_id.value;
    const postTitle = $form.elements.post_title.value;
    const postBody = $form.elements.post_body.value;

    // и закрываем модалку
    closeModal();

    // посылаем patch запрос с данными из формы
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
      // находим изменённый пост в списке
      const patchedPostIndex = posts.findIndex((post) => post.id === patchedPost.id);
      // и заменяем старый на новый
      posts[patchedPostIndex] = patchedPost;
      // обновляем список
      renderPosts(posts);
    });
  })
  
  $delete_btn.addEventListener('click', function() {
    // получаем id поста для удаления
    const postId = $form.elements.post_id.value;

    closeModal();

    // посылаем запрос
    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if(res.ok) {
          // если ок, то находим удалённый пост
          const deletedPostIndex = posts.findIndex((post) => post.id == postId);
          // и вырезаем его из массива
          posts.splice(deletedPostIndex, 1);
          // обновляем список
          renderPosts(posts);
        } else {
          console.log('Something went wrong :(');
        }
      })
  })
  
})