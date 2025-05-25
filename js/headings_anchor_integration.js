document.addEventListener('DOMContentLoaded', function() {
    // Находим все элементы h1, у которых есть атрибут id
    const headingsWithId = document.querySelectorAll('h1[id]');

    headingsWithId.forEach(heading => {
        const targetId = heading.id; // Получаем ID текущего h1

        heading.addEventListener('click', function(event) {
            event.preventDefault(); // Предотвращаем стандартное поведение (если бы это была ссылка)

            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Плавная прокрутка к элементу
                // Современный способ через CSS: html { scroll-behavior: smooth; }
                // Если CSS способ не используется или для большей совместимости:
                targetElement.scrollIntoView({
                    behavior: 'smooth', // Плавная прокрутка
                    block: 'start'      // Выровнять по верхнему краю элемента
                });

                // Если вы хотите также обновить URL с якорем (необязательно):
                window.location.hash = targetId;
                // Но будьте осторожны: это вызовет "прыжок", если scroll-behavior: smooth не работает
                // или если вы не используете event.preventDefault() на ссылках.
                // В данном случае, так как это не ссылка, а H1, это может быть полезно
                // для обновления URL без "прыжка", если CSS scroll-behavior: smooth уже есть.
                // Если вы раскомментируете это, возможно, стоит убрать event.preventDefault()
                // и обернуть H1 в <a>, но тогда изначальный вопрос немного меняется.
                // Для просто клика по H1 и скролла, без обновления hash, текущий вариант лучше.
            }
        });
    });


    window.addEventListener('scroll', function () {
        if (window.scrollY === 0 && window.location.hash) {
            // Удалить якорь из URL, не перезагружая страницу
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
     });
});