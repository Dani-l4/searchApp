Перенёс всё из modal.js в script.js, чтобы после PATCH запроса рендерить посты заново.
В modal функция недоступна, а при выносе её из обработчика ломается код. Не знаю как правильно

new FormData($form) - не работает