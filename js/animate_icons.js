function animateTechIcons() {
    const iconContainer = document.querySelector('.tech-stack-icons.fan-out');
    if (!iconContainer) return;

    const icons = iconContainer.querySelectorAll('.tech-icon');
    if (icons.length === 0) return;

    const containerRect = iconContainer.getBoundingClientRect();

    const spreadRadiusX = containerRect.width * 0.9;
    const spreadRadiusY = containerRect.height * 0.60;

    const baseDelay = 100;
    const staggerDelay = 150;

    icons.forEach((icon, index) => {
        const angleStep = (Math.PI * 2) / icons.length;
        const angle = angleStep * index + (Math.random() - 0.5) * (angleStep * 0.3);

        const randomDistanceFactor = 0.7 + Math.random() * 0.4;

        const finalX = Math.cos(angle) * spreadRadiusX * randomDistanceFactor;
        const finalY = Math.sin(angle) * spreadRadiusY * randomDistanceFactor;

        const finalRotation = (Math.random() - 0.5) * 70;

        const delay = baseDelay + index * staggerDelay;

        setTimeout(() => {
            icon.style.opacity = '1';
            icon.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)) scale(1) rotate(${finalRotation}deg)`;
        }, delay);
    });
}

const firstContentBlock = document.querySelector('.content');
if (firstContentBlock) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateTechIcons, 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(firstContentBlock);
}

window.onload = function() {
    document.body.style.visibility = 'visible';
};

Array.from(document.getElementsByTagName('img')).forEach((image) => {
    image.setAttribute('draggable', false);
});