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
            const wasSticky = gigaLogo.classList.contains('is-sticky');
            const wasHidden = gigaLogo.classList.contains('is-hidden-for-docking');
            gigaLogo.classList.remove('is-sticky', 'is-hidden-for-docking');

            const logoHeight = gigaLogo.offsetHeight;

            if (wasSticky) gigaLogo.classList.add('is-sticky');
            if (wasHidden) gigaLogo.classList.add('is-hidden-for-docking');


            if (logoHeight > 0) {
                stickyWrapper.style.height = `${logoHeight}px`;
                logoStopContainer.style.height = `${logoHeight}px`;
            } else if (window.innerWidth > mobileBreakpoint) {
                console.warn('gigaLogo offsetHeight is 0 in setStaticHeights. Attempting fallback or CSS should handle.');
            }
        } else {
            stickyWrapper.style.height = 'auto';
            logoStopContainer.style.height = 'auto';
        }
    }

    function updateWrapperHeights() {
        if (window.innerWidth > mobileBreakpoint &&
            !gigaLogo.classList.contains('is-sticky') &&
            !gigaLogo.classList.contains('is-hidden-for-docking')) {

            const logoHeight = gigaLogo.offsetHeight;
            if (logoHeight > 0) {
                stickyWrapper.style.height = `${logoHeight}px`;
                logoStopContainer.style.height = `${logoHeight}px`;
            } else {
                console.warn('gigaLogo offsetHeight is 0 in updateWrapperHeights. Styles or SVG might not be fully loaded/rendered.');
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

        gigaLogo.classList.remove('is-sticky', 'is-hidden-for-docking');
        dockedGigaLogo.classList.remove('is-visible');

        if (window.innerWidth <= mobileBreakpoint) {
            return;
        }

        const windowHeight = window.innerHeight;
        const currentScroll = window.pageYOffset;

        const wrapperRect = stickyWrapper.getBoundingClientRect();
        const logoRect = gigaLogo.getBoundingClientRect();
        const logoHeight = logoRect.height;

        if (wrapperRect.height === 0 && logoHeight > 0) {
            console.warn(`stickyWrapper height is 0, but gigaLogo height is ${logoHeight}. Check CSS.`);
        }


        const wrapperTop_document = currentScroll + wrapperRect.top;
        const wrapperCenterY_document = wrapperTop_document + (wrapperRect.height / 2);
        stickyStartPointY = wrapperCenterY_document - (windowHeight / 2);

        const stopContainerRect = logoStopContainer.getBoundingClientRect();
        const stopContainerTop_document = currentScroll + stopContainerRect.top;
        const stickyLogoTopInViewport = (windowHeight / 2) - (logoHeight / 2);
        dockingPointY = stopContainerTop_document - stickyLogoTopInViewport;

        updateWrapperHeights();
    }

    setTimeout(() => {
        calculatePoints();
        handleScroll();
    }, 100);

    window.addEventListener('resize', debounce(() => {
        gigaLogo.classList.remove('is-sticky', 'is-hidden-for-docking');
        dockedGigaLogo.classList.remove('is-visible');

        setTimeout(() => {
            calculatePoints();
            handleScroll();
        }, 50);
    }, 250));


    function handleScroll() {
    if (window.innerWidth <= mobileBreakpoint) {
        gigaLogo.className = 'giga-logo';
        dockedGigaLogo.className = 'giga-logo';
        stickyWrapper.style.height = 'auto';
        logoStopContainer.style.height = 'auto';
        return;
    }

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    let shouldBeSticky = false;
    let shouldBeDocked = false;

    if (scrollPosition >= dockingPointY) {
        shouldBeDocked = true;
    } else if (scrollPosition >= stickyStartPointY) {
        shouldBeSticky = true;
    }

    if (shouldBeDocked) {
        if (!dockedGigaLogo.classList.contains('is-visible')) {
            dockedGigaLogo.classList.add('is-visible');
        }
        if (!gigaLogo.classList.contains('is-hidden-for-docking')) {
            gigaLogo.classList.add('is-hidden-for-docking');
        }
        if (gigaLogo.classList.contains('is-sticky')) {
            gigaLogo.classList.remove('is-sticky');
        }
        updateWrapperHeights();
    } else if (shouldBeSticky) {
        if (!gigaLogo.classList.contains('is-sticky')) {
            updateWrapperHeights();
            gigaLogo.classList.add('is-sticky');
        }
        if (gigaLogo.classList.contains('is-hidden-for-docking')) {
            gigaLogo.classList.remove('is-hidden-for-docking');
        }
        if (dockedGigaLogo.classList.contains('is-visible')) {
            dockedGigaLogo.classList.remove('is-visible');
        }
    } else {
        if (gigaLogo.classList.contains('is-sticky')) {
            gigaLogo.classList.remove('is-sticky');
        }
        if (gigaLogo.classList.contains('is-hidden-for-docking')) {
            gigaLogo.classList.remove('is-hidden-for-docking');
        }
        if (dockedGigaLogo.classList.contains('is-visible')) {
            dockedGigaLogo.classList.remove('is-visible');
        }
    }
}

    window.addEventListener('scroll', debounce(handleScroll, 5));
});

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