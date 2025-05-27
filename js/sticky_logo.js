window.addEventListener('DOMContentLoaded', () => {
    const stickyWrapper = document.querySelector('.giga-logo-sticky-wrapper');
    const gigaLogo = document.getElementById('gigaLogo');
    const mobileBreakpoint = 768; // Определяем нашу точку перехода (как в CSS)

    if (!stickyWrapper || !gigaLogo) {
        console.warn('Giga logo sticky elements not found!');
        return;
    }

    function setWrapperHeight() {
        // Устанавливаем высоту обертки, чтобы предотвратить прыжок контента
        // Эта функция должна вызываться, когда размеры логотипа в потоке известны
        // и перед тем, как логотип станет 'sticky'
        if (window.innerWidth > mobileBreakpoint) { // Устанавливаем высоту только если стики будет работать
             stickyWrapper.style.height = `${gigaLogo.offsetHeight}px`;
        } else {
            stickyWrapper.style.height = 'auto'; // На мобильных пусть высота будет автоматической
        }
    }

    let stickyPointY = 0;

    function calculateStickyPoint() {
        if (window.innerWidth <= mobileBreakpoint) {
            // Если экран узкий, нам не нужно вычислять точку прилипания,
            // так как поведение sticky будет отключено.
            // Можно также удалить класс is-sticky, если он был добавлен ранее.
            if (gigaLogo.classList.contains('is-sticky')) {
                gigaLogo.classList.remove('is-sticky');
            }
            stickyWrapper.style.height = 'auto'; // Возвращаем авто высоту обертке
            return; // Выходим, если экран узкий
        }

        setWrapperHeight(); // Вызываем перед расчетом, если не делали этого ранее глобально

        const wrapperRect = stickyWrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const wrapperCenterY_document = window.pageYOffset + wrapperRect.top + (wrapperRect.height / 2);
        const offsetToBecomeSticky = 0; // Небольшое опережение

        stickyPointY = wrapperCenterY_document - (windowHeight / 2) - offsetToBecomeSticky;
    }

    // Вычисляем при загрузке и при изменении размера окна
    calculateStickyPoint(); // Первоначальный расчет
    window.addEventListener('resize', debounce(() => {
        calculateStickyPoint(); // Пересчет при ресайзе
        // Дополнительно проверим, нужно ли применять/снимать sticky после ресайза
        // на основе текущей прокрутки и новой точки прилипания / ширины экрана
        handleScroll();
    }, 100));


    function handleScroll() {
        if (window.innerWidth <= mobileBreakpoint) {
            // Если экран узкий, убедимся, что логотип не "липкий"
            if (gigaLogo.classList.contains('is-sticky')) {
                gigaLogo.classList.remove('is-sticky');
                stickyWrapper.style.height = 'auto'; // Если нужно
            }
            return; // Ничего не делаем на узких экранах
        }

        // Если мы здесь, значит экран широкий и sticky-поведение должно работать
        // Убедимся, что wrapper имеет высоту, если он ее терял
        if (stickyWrapper.style.height === 'auto' || !stickyWrapper.style.height) {
             setWrapperHeight(); // Установим высоту, если не была установлена
        }


        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollPosition >= stickyPointY) {
            if (!gigaLogo.classList.contains('is-sticky')) {
                // Перед тем как сделать sticky, убедимся, что обертка имеет высоту
                setWrapperHeight(); // Важно вызвать перед добавлением класса
                gigaLogo.classList.add('is-sticky');
            }
        } else {
            if (gigaLogo.classList.contains('is-sticky')) {
                gigaLogo.classList.remove('is-sticky');
                // Можно сбросить высоту обертки, если она вычислялась динамически
                // stickyWrapper.style.height = 'auto'; // Но это может вызвать прыжок при обратном скролле
            }
        }
    }

    window.addEventListener('scroll', debounce(handleScroll, 10)); // Уменьшаем задержку для scroll, если нужно быстрее
});

// Debounce функция
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}