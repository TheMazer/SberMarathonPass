function centerFirstContentBlock() {
    const contentWrapper = document.querySelector('.content-wrapper');
    const firstContentElement = document.querySelector('.content-wrapper > .content:first-child');

    if (contentWrapper && firstContentElement) {
        const viewportHeight = window.innerHeight;
        const firstContentHeight = firstContentElement.offsetHeight;

        // Рассчитываем отступ сверху для .content-wrapper
        // чтобы первый .content блок оказался по центру
        let paddingTop = (viewportHeight - firstContentHeight) / 2;

        // Убедимся, что отступ не отрицательный
        // Если контент выше экрана, он начнется с самого верха (или с минимального отступа)
        paddingTop = Math.max(32, paddingTop);

        contentWrapper.style.paddingTop = paddingTop + 'px';
    }
}

// Пересчитываем при изменении размера окна
window.addEventListener('resize', centerFirstContentBlock);