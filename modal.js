const $modal = document.getElementById('modal');
const $form = document.querySelector('.form');

function openModal() {
  document.body.classList.add('lock');
  $modal.classList.add('open');
}

function closeModal() {
  document.body.classList.remove('lock');
  $modal.classList.remove('open');
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

document.addEventListener('fetchedNbuilded', function() {
  let cards = document.querySelectorAll('.card');
  
  for (let card of cards){
    card.addEventListener('click', editPost)
  }
})

function editPost(e) {
  const card = this;
  const $postId = $form.elements['post_id'];
  const $postTitle = $form.elements['post_title'];
  const $postBody = $form.elements['post_body'];

  $postId.value = card.dataset.id;
  $postTitle.value = card.dataset.title;
  $postBody.value = card.dataset.body;

  $postBody.style.height = $postBody.scrollHeight + 'px';

  openModal()

  e.preventDefault()
}
