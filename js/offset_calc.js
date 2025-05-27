function centerFirstContentBlock() {
    const contentWrapper = document.querySelector('.content-wrapper');
    const firstContentElement = document.querySelector('.content-wrapper > .content:first-child');

    if (contentWrapper && firstContentElement) {
        const viewportHeight = window.innerHeight;
        const firstContentHeight = firstContentElement.offsetHeight;

        let paddingTop = (viewportHeight - firstContentHeight) / 2;

        paddingTop = Math.max(32, paddingTop);

        contentWrapper.style.paddingTop = paddingTop + 'px';
    }
}

window.addEventListener('resize', centerFirstContentBlock);