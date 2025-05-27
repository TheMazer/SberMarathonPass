window.addEventListener('DOMContentLoaded', () => {
    const stickyWrapper = document.querySelector('.giga-logo-sticky-wrapper');
    const gigaLogo = document.getElementById('gigaLogo');
    const logoStopContainer = document.getElementById('logoStopContainer');
    const dockedGigaLogo = document.getElementById('dockedGigaLogo');
    const mobileBreakpoint = 768;

    if (!stickyWrapper || !gigaLogo || !logoStopContainer || !dockedGigaLogo) {
        console.warn('Required elements not found!');
        return;
    }

    function setStaticHeights() {
        if (window.innerWidth > mobileBreakpoint) {
            // Получаем высоту от gigaLogo, так как он является "эталоном"
            // Важно, чтобы gigaLogo был в потоке и видим для корректного offsetHeight
            // Если gigaLogo скрыт, нужно получить его высоту другим способом или использовать сохраненное значение.
            
            // Сначала убедимся, что gigaLogo не sticky и не hidden, чтобы получить его потоковую высоту
            const wasSticky = gigaLogo.classList.contains('is-sticky');
            const wasHidden = gigaLogo.classList.contains('is-hidden-for-docking');
            gigaLogo.classList.remove('is-sticky', 'is-hidden-for-docking');
            // Можно временно сделать его видимым, если он был скрыт из-за мобильного вида
            // const originalDisplay = gigaLogo.style.display;
            // if (window.getComputedStyle(gigaLogo).display === 'none') gigaLogo.style.display = 'block';

            const logoHeight = gigaLogo.offsetHeight;

            // Восстанавливаем классы
            if (wasSticky) gigaLogo.classList.add('is-sticky');
            if (wasHidden) gigaLogo.classList.add('is-hidden-for-docking');
            // if (window.getComputedStyle(gigaLogo).display === 'none') gigaLogo.style.display = originalDisplay;


            if (logoHeight > 0) {
                stickyWrapper.style.height = `${logoHeight}px`;
                logoStopContainer.style.height = `${logoHeight}px`; // <-- КЛЮЧЕВОЙ МОМЕНТ
                // console.log(`Set static heights to: ${logoHeight}px`);
            } else if (window.innerWidth > mobileBreakpoint) { // Если logoHeight 0, но мы на десктопе
                // console.warn('gigaLogo offsetHeight is 0 in setStaticHeights. Attempting fallback or CSS should handle.');
                // Тут можно либо ничего не делать, полагаясь на CSS min-height,
                // либо использовать какую-то "запасную" высоту, если это критично.
                // Если CSS для .logo-stop-container уже задает min-height, это может быть достаточно.
            }
        } else {
            stickyWrapper.style.height = 'auto';
            logoStopContainer.style.height = 'auto';
        }
    }

    // --- Управление высотами оберток ---
    function updateWrapperHeights() {
        // Эта функция вызывается, когда нужно зафиксировать высоты
        // оберток на основе текущей высоты gigaLogo.
        // Это нужно, когда gigaLogo НЕ fixed и НЕ docked.
        if (window.innerWidth > mobileBreakpoint &&
            !gigaLogo.classList.contains('is-sticky') &&
            !gigaLogo.classList.contains('is-hidden-for-docking')) { // Убедимся, что лого в потоке

            const logoHeight = gigaLogo.offsetHeight;
            if (logoHeight > 0) { // Убедимся, что высота не нулевая
                stickyWrapper.style.height = `${logoHeight}px`;
                logoStopContainer.style.height = `${logoHeight}px`;
                // console.log(`Set wrapper heights to: ${logoHeight}px`);
            } else {
                // console.warn('gigaLogo offsetHeight is 0 in updateWrapperHeights. Styles or SVG might not be fully loaded/rendered.');
            }
        } else {
            stickyWrapper.style.height = 'auto';
            logoStopContainer.style.height = 'auto';
        }
    }

    let stickyStartPointY = 0;
    let dockingPointY = 0;

    function calculatePoints() {
        setStaticHeights();

        // 0. Сброс классов, чтобы получить размеры из потока
        gigaLogo.classList.remove('is-sticky', 'is-hidden-for-docking');
        dockedGigaLogo.classList.remove('is-visible');
        // Временно возвращаем высоты wrapper'ов в auto для корректного измерения, ЕСЛИ
        // их высота в потоке должна определяться CSS, а не JS-установленной высотой лого.
        // Если их высота в потоке ВСЕГДА должна быть равна высоте лого, то этот сброс не нужен.
        // stickyWrapper.style.height = 'auto';
        // logoStopContainer.style.height = 'auto';

        if (window.innerWidth <= mobileBreakpoint) {
            return;
        }

        // --- 1. Получаем актуальные размеры и позиции ---
        // Убедимся, что gigaLogo имеет свою "потоковую" высоту перед измерением wrapper'а
        // Это особенно важно, если SVG лениво грузится или его размеры зависят от CSS,
        // который применяется с задержкой.
        // Можно попробовать requestAnimationFrame для ожидания следующего кадра отрисовки.
        
        // Лучше всего, если CSS для .giga-logo-sticky-wrapper и .giga-logo
        // изначально задают им правильные размеры в потоке.
        // Тогда JS не должен сильно вмешиваться в их высоту ДО того, как лого станет sticky.

        const windowHeight = window.innerHeight;
        const currentScroll = window.pageYOffset;

        // Размеры и позиция ОБЕРТКИ gigaLogo
        const wrapperRect = stickyWrapper.getBoundingClientRect();
        // Размеры самого gigaLogo (могут понадобиться для dockingPointY)
        const logoRect = gigaLogo.getBoundingClientRect(); // Получаем актуальные размеры логотипа
        const logoHeight = logoRect.height;

        if (wrapperRect.height === 0 && logoHeight > 0) {
            // Если wrapper почему-то имеет нулевую высоту, но логотип внутри него нет,
            // это может быть проблемой. Возможно, wrapper'у нужны стили типа min-height
            // или он должен наследовать высоту от лого.
            // В идеале, wrapperRect.height должен быть >= logoHeight.
            // console.warn(`stickyWrapper height is 0, but gigaLogo height is ${logoHeight}. Check CSS.`);
        }


        // --- 2. Вычисляем stickyStartPointY ---
        // Используем центр stickyWrapper для определения, когда ОН должен быть в центре экрана
        const wrapperTop_document = currentScroll + wrapperRect.top;
        const wrapperCenterY_document = wrapperTop_document + (wrapperRect.height / 2);
        stickyStartPointY = wrapperCenterY_document - (windowHeight / 2);

        // --- 3. Вычисляем dockingPointY ---
        const stopContainerRect = logoStopContainer.getBoundingClientRect();
        const stopContainerTop_document = currentScroll + stopContainerRect.top;
        const stickyLogoTopInViewport = (windowHeight / 2) - (logoHeight / 2); // Верх sticky лого во вьюпорте
        dockingPointY = stopContainerTop_document - stickyLogoTopInViewport;

        // --- Логирование для отладки ---
        // console.clear(); // Очищаем консоль перед новыми логами для удобства
        // console.log('--- calculatePoints ---');
        // console.log(`Window H: ${windowHeight}, Window Center Y (viewport): ${windowHeight / 2}`);
        // console.log(`Current Scroll: ${currentScroll}`);
        // console.log(`Wrapper Top (viewport): ${wrapperRect.top.toFixed(2)}, Wrapper H: ${wrapperRect.height.toFixed(2)}`);
        // console.log(`Wrapper Top (doc): ${wrapperTop_document.toFixed(2)}, Wrapper Center (doc): ${wrapperCenterY_document.toFixed(2)}`);
        // console.log(`Logo H: ${logoHeight.toFixed(2)}`);
        // console.log(`stickyStartPointY (scroll for center): ${stickyStartPointY.toFixed(2)}`);
        // console.log(`StopContainer Top (doc): ${stopContainerTop_document.toFixed(2)}`);
        // console.log(`dockingPointY (scroll to dock): ${dockingPointY.toFixed(2)}`);
        // console.log('-----------------------');

        // --- 4. Устанавливаем высоты оберток для работы sticky/docking ---
        // Это делается ПОСЛЕ всех расчетов, чтобы не влиять на них.
        updateWrapperHeights(); // Эта функция теперь должна использовать logoHeight, который мы уже получили
    }
    
    // Переопределяем updateWrapperHeights, чтобы она использовала уже известную logoHeight
    // Это более чистый подход, чем передавать logoHeight как параметр.
    // Но для простоты оставим предыдущую версию updateWrapperHeights,
    // которая сама получает gigaLogo.offsetHeight.

    // Инициализация
    // Задержка перед первым calculatePoints, чтобы дать SVG/стилям шанс загрузиться
    // Это "костыль", лучше если размеры стабильны с самого начала из-за CSS.
    setTimeout(() => {
        calculatePoints();
        handleScroll(); // Проверить начальное состояние
    }, 100); // Можно увеличить задержку, если SVG грузится долго

    window.addEventListener('resize', debounce(() => {
        // Перед ресайзом сбрасываем классы, чтобы размеры были потоковыми
        gigaLogo.classList.remove('is-sticky', 'is-hidden-for-docking');
        dockedGigaLogo.classList.remove('is-visible');
        // stickyWrapper.style.height = 'auto'; // Опционально, если нужно пересчитать "естественную" высоту
        // logoStopContainer.style.height = 'auto';

        setTimeout(() => { // Даем время на перестроение DOM после ресайза
            calculatePoints();
            handleScroll();
        }, 50);
    }, 250));


    function handleScroll() {
    if (window.innerWidth <= mobileBreakpoint) {
        gigaLogo.className = 'giga-logo'; // Сбрасываем до базового класса
        dockedGigaLogo.className = 'giga-logo'; // Сбрасываем до базового класса
        stickyWrapper.style.height = 'auto';
        logoStopContainer.style.height = 'auto';
        return;
    }

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    // console.log(`Scroll: ${scrollPosition.toFixed(0)}, StartY: ${stickyStartPointY.toFixed(0)}, DockY: ${dockingPointY.toFixed(0)}`);

    // Сначала определяем, в каком состоянии мы ДОЛЖНЫ быть
    let shouldBeSticky = false;
    let shouldBeDocked = false;

    if (scrollPosition >= dockingPointY) {
        shouldBeDocked = true;
    } else if (scrollPosition >= stickyStartPointY) {
        shouldBeSticky = true;
    }
    // Иначе - состояние "в потоке" (Flow)

    // Теперь применяем классы на основе этого решения
    // Это предотвращает конфликты, если классы не были убраны ранее

    if (shouldBeDocked) {
        if (!dockedGigaLogo.classList.contains('is-visible')) {
            dockedGigaLogo.classList.add('is-visible');
        }
        if (!gigaLogo.classList.contains('is-hidden-for-docking')) {
            gigaLogo.classList.add('is-hidden-for-docking');
        }
        // Убедимся, что sticky убран, если мы docked
        if (gigaLogo.classList.contains('is-sticky')) {
            gigaLogo.classList.remove('is-sticky');
        }
         // Убедимся, что обертки имеют высоту (особенно stopContainer)
        updateWrapperHeights(); // Эта функция должна корректно выставлять высоты для обоих контейнеров
    } else if (shouldBeSticky) {
        if (!gigaLogo.classList.contains('is-sticky')) {
            updateWrapperHeights(); // Устанавливаем высоту stickyWrapper перед тем как сделать sticky
            gigaLogo.classList.add('is-sticky');
        }
        // Убираем другие состояния
        if (gigaLogo.classList.contains('is-hidden-for-docking')) {
            gigaLogo.classList.remove('is-hidden-for-docking');
        }
        if (dockedGigaLogo.classList.contains('is-visible')) {
            dockedGigaLogo.classList.remove('is-visible');
        }
    } else { // Состояние "в потоке"
        if (gigaLogo.classList.contains('is-sticky')) {
            gigaLogo.classList.remove('is-sticky');
        }
        if (gigaLogo.classList.contains('is-hidden-for-docking')) {
            gigaLogo.classList.remove('is-hidden-for-docking');
        }
        if (dockedGigaLogo.classList.contains('is-visible')) {
            dockedGigaLogo.classList.remove('is-visible');
        }
        // В состоянии "в потоке" высоты оберток должны быть auto или определяться CSS
        // (updateWrapperHeights должна это учитывать или не вызываться здесь,
        // если calculatePoints устанавливает их в auto для потока)
        // stickyWrapper.style.height = 'auto'; // Если это не делается в calculatePoints
        // logoStopContainer.style.height = 'auto';
    }
}

    window.addEventListener('scroll', debounce(handleScroll, 5)); // Можно уменьшить debounce для scroll
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