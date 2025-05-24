function animateTechIcons() {
    const iconContainer = document.querySelector('.tech-stack-icons.fan-out');
    if (!iconContainer) return;

    const icons = iconContainer.querySelectorAll('.tech-icon');
    if (icons.length === 0) return;

    const containerRect = iconContainer.getBoundingClientRect();

    // Определяем "радиусы" разлета для оси X и Y отдельно
    // Это будут полуоси нашего эллипса разлета
    // Коэффициенты можно настроить для желаемой формы эллипса
    const spreadRadiusX = containerRect.width * 0.9;  // Например, 45% ширины контейнера
    const spreadRadiusY = containerRect.height * 0.60; // Например, 60% высоты контейнера
                                                      // Увеличив этот коэффициент > 0.5, иконки могут вылетать "выше" и "ниже" центра
                                                      // на расстояние большее, чем половина высоты контейнера.

    const baseDelay = 100; // мс, базовая задержка перед стартом анимации первой иконки
    const staggerDelay = 150; // мс, задержка между появлением каждой следующей иконки

    icons.forEach((icon, index) => {
        // Угол в радианах
        const angleStep = (Math.PI * 2) / icons.length;
        // Добавляем небольшую случайность к углу для менее строгого распределения
        const angle = angleStep * index + (Math.random() - 0.5) * (angleStep * 0.3);

        // Случайный множитель для расстояния от центра (чтобы не все иконки были на одной "орбите")
        // От 70% до 110% от максимального радиуса по этой оси
        const randomDistanceFactor = 0.7 + Math.random() * 0.4;

        // Конечное смещение по X и Y, используя отдельные радиусы для эллиптической траектории
        const finalX = Math.cos(angle) * spreadRadiusX * randomDistanceFactor;
        const finalY = Math.sin(angle) * spreadRadiusY * randomDistanceFactor;

        // Случайное вращение иконки
        const finalRotation = (Math.random() - 0.5) * 70; // от -35 до +35 градусов

        const delay = baseDelay + index * staggerDelay;

        setTimeout(() => {
            icon.style.opacity = '1';
            icon.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)) scale(1) rotate(${finalRotation}deg)`;
        }, delay);
    });
}

// Вызываем анимацию. Лучше всего - когда первый блок .content становится видимым.
// Для простоты пока вызовем после загрузки страницы.
// window.addEventListener('load', animateTechIcons);

// Более продвинутый вариант с Intersection Observer:
const firstContentBlock = document.querySelector('.content'); // Предполагаем, что это первый блок
if (firstContentBlock) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавим небольшую задержку после того, как блок стал видимым,
                // чтобы пользователь успел его заметить перед анимацией иконок
                setTimeout(animateTechIcons, 500); // Например, 500 мс
                observer.unobserve(entry.target); // Анимируем только один раз
            }
        });
    }, { threshold: 0.3 }); // Запускаем, когда 30% блока видно

    observer.observe(firstContentBlock);
}

// Если ваш JS для центрирования первого блока уже есть:
window.onload = function() {
    document.body.style.visibility = 'visible';
    // centerFirstContentBlock(); // Ваша функция центрирования
    // animateTechIcons(); // Теперь можно вызывать здесь, если IntersectionObserver не используется
};

Array.from(document.getElementsByTagName('img')).forEach((image) => {
    image.setAttribute('draggable', false);
});