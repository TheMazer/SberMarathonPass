document.addEventListener('DOMContentLoaded', function() {
    const headingsWithId = document.querySelectorAll('h1[id]');

    headingsWithId.forEach(heading => {
        const targetId = heading.id;

        heading.addEventListener('click', function(event) {
            event.preventDefault();

            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                window.location.hash = targetId;
            }
        });
    });


    window.addEventListener('scroll', function () {
        if (window.scrollY === 0 && window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
     });
});