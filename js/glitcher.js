const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

const sourceImageElements = [
    document.getElementById('sourceImage0'),
    document.getElementById('sourceImage1'),
    document.getElementById('sourceImage2'),
    document.getElementById('sourceImage3'),
];
const loadedImages = []; // Здесь будут храниться загруженные объекты Image

// --- Параметры глитча (можете настроить) ---
const SLICE_COUNT_MIN = 3;
const SLICE_COUNT_MAX = 15;
const SLICE_HEIGHT_MIN = 2;
const SLICE_HEIGHT_MAX = 160;

const HORIZONTAL_DISPLACEMENT_MAX = 10;
const CHANCE_OF_LAYER_DRAW = 0.85; // Шанс отрисовки кусков из одного из изображений
const GLITCH_FRAME_RATE = 1000 / 8; // ~12 FPS для глитч-обновлений

let lastGlitchTime = 0;
let canvasBaseWidth, canvasBaseHeight; // Размеры, по которым будет настроен канвас (от первого изображения)

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawGlitchEffect() {
    if (loadedImages.length < sourceImageElements.length) return; // Не все изображения загружены

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0; // Сброс общей прозрачности
    ctx.globalCompositeOperation = 'source-over'; // Сброс режима наложения

    // Иногда рисуем базовый слой (например, из первого изображения, менее глитченый)
    if (Math.random() < 0.5) {
        const baseImg = loadedImages[0];
        const sliceY = getRandomInt(0, baseImg.naturalHeight - SLICE_HEIGHT_MAX);
        const sliceH = getRandomInt(baseImg.naturalHeight / 5, baseImg.naturalHeight / 3);
        ctx.drawImage(baseImg, 0, sliceY, baseImg.naturalWidth, sliceH, 0, sliceY * (canvas.height / baseImg.naturalHeight) , canvas.width, sliceH * (canvas.height / baseImg.naturalHeight));
    }


    // Слой 1: Куски из первого изображения
    if (Math.random() < CHANCE_OF_LAYER_DRAW) {
        drawRandomSlices(loadedImages[0], 0.8, HORIZONTAL_DISPLACEMENT_MAX * 0.7, 'rgba(255,80,80,0.05)');
    }

    // Слой 2: Куски из второго изображения
    if (Math.random() < CHANCE_OF_LAYER_DRAW) {
        ctx.globalCompositeOperation = 'lighter'; // или 'screen'
        drawRandomSlices(loadedImages[1], 0.7, HORIZONTAL_DISPLACEMENT_MAX, 'rgba(80,255,80,0.05)', -1); // смещение в другую сторону
        ctx.globalCompositeOperation = 'source-over';
    }

    // Слой 3: Куски из третьего изображения
    if (Math.random() < CHANCE_OF_LAYER_DRAW) {
        ctx.globalCompositeOperation = 'lighter'; // или 'difference'
        drawRandomSlices(loadedImages[2], 0.75, HORIZONTAL_DISPLACEMENT_MAX * 1.2, 'rgba(80,80,255,0.05)');
        ctx.globalCompositeOperation = 'source-over';
    }

    // Дополнительный эффект: случайные "помехи" или тонкие линии
    if (Math.random() < 0.3) {
        addNoiseLines();
    }
}

function drawRandomSlices(sourceImage, opacity, maxDisplacement, colorTint = null, displacementDirection = 1) {
    const numSlices = getRandomInt(SLICE_COUNT_MIN, SLICE_COUNT_MAX);
    const sourceImgWidth = sourceImage.naturalWidth;
    const sourceImgHeight = sourceImage.naturalHeight;

    ctx.globalAlpha = opacity;

    for (let i = 0; i < numSlices; i++) {
        const sourceY = getRandomInt(0, sourceImgHeight - SLICE_HEIGHT_MIN);
        let sliceHeightOnSource = getRandomInt(SLICE_HEIGHT_MIN, SLICE_HEIGHT_MAX);

        if (sourceY + sliceHeightOnSource > sourceImgHeight) {
            sliceHeightOnSource = sourceImgHeight - sourceY;
        }
        if (sliceHeightOnSource <= 0) continue;

        // Рассчитываем высоту куска на канвасе, сохраняя пропорции относительно высоты исходного изображения и канваса
        const sliceHeightOnCanvas = sliceHeightOnSource * (canvas.height / sourceImgHeight);
        // Рассчитываем Y-позицию на канвасе, также пропорционально
        const destYOnCanvas = sourceY * (canvas.height / sourceImgHeight);


        const destX = (Math.random() - 0.5) * 2 * maxDisplacement * displacementDirection;

        ctx.drawImage(
            sourceImage,
            0, sourceY,
            sourceImgWidth, sliceHeightOnSource,
            destX, destYOnCanvas,
            canvas.width, sliceHeightOnCanvas // Рисуем на всю ширину канваса, высота масштабируется
        );

        if (colorTint) {
            const originalCompositeOp = ctx.globalCompositeOperation;
            const originalAlpha = ctx.globalAlpha;
            let alphaFromTint = parseFloat(colorTint.split(',')[3] || '0.1');

            ctx.fillStyle = colorTint;
            // Для 'lighter' лучше не менять composite operation для тинта,
            // а просто рисовать полупрозрачный цветной прямоугольник
            if (originalCompositeOp !== 'lighter' && originalCompositeOp !== 'screen') {
                 ctx.globalCompositeOperation = 'color'; // или 'multiply'
            }
            ctx.globalAlpha = alphaFromTint;

            ctx.fillRect(destX, destYOnCanvas, canvas.width, sliceHeightOnCanvas);

            ctx.globalCompositeOperation = originalCompositeOp;
            ctx.globalAlpha = opacity; // Восстанавливаем общую прозрачность слоя, не тинта
        }
    }
    ctx.globalAlpha = 1.0; // Сброс общей прозрачности для следующих операций
}

function addNoiseLines() {
    const lines = getRandomInt(5, 20);
    for (let i = 0; i < lines; i++) {
        ctx.fillStyle = `rgba(${getRandomInt(0,255)}, ${getRandomInt(0,255)}, ${getRandomInt(0,255)}, ${Math.random() * 0.3})`;
        ctx.fillRect(
            getRandomInt(-canvas.width * 0.1, canvas.width * 0.9), // Может начинаться за пределами
            Math.random() * canvas.height,
            getRandomInt(canvas.width * 0.1, canvas.width * 0.5), // Длина линии
            getRandomInt(1, 3) // Толщина линии
        );
    }
}


let animationFrameId;
function animationLoop(timestamp) {
    if (timestamp - lastGlitchTime > GLITCH_FRAME_RATE) {
        lastGlitchTime = timestamp;
        drawGlitchEffect();
    }
    animationFrameId = requestAnimationFrame(animationLoop);
}

function setupCanvas() {
    // Используем размеры первого изображения как основу для канваса
    // или если они не загружены, дефолтные
    const firstImage = loadedImages[0] || { naturalWidth: 600, naturalHeight: 400};
    canvasBaseWidth = firstImage.naturalWidth;
    canvasBaseHeight = firstImage.naturalHeight;

    const style = getComputedStyle(canvas);
    const cssWidth = parseInt(style.width, 10) || window.innerWidth * 0.9;
    const cssHeight = parseInt(style.height, 10) || window.innerHeight * 0.9;

    const aspectRatio = canvasBaseWidth / canvasBaseHeight;
    if (cssWidth / cssHeight > aspectRatio) {
        canvas.height = cssHeight;
        canvas.width = cssHeight * aspectRatio;
    } else {
        canvas.width = cssWidth;
        canvas.height = cssWidth / aspectRatio;
    }
    // Важно: убедиться, что canvas.width и canvas.height не 0
    if (canvas.width === 0 || canvas.height === 0) {
        console.warn("Canvas dimensions are zero. Using fallback.");
        canvas.width = Math.min(cssWidth, 600); // Fallback width
        canvas.height = canvas.width / aspectRatio;
        if (isNaN(canvas.height) || canvas.height === 0) canvas.height = Math.min(cssHeight, 400); // Fallback height
    }


    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    // Очистим перед первым запуском, если размеры изменились
    if (ctx) ctx.clearRect(0,0,canvas.width, canvas.height);
    animationLoop(0);
}

// --- Инициализация ---
const loadImagePromises = sourceImageElements.map(imgEl => {
    return new Promise((resolve, reject) => {
        if (imgEl.complete && imgEl.naturalWidth > 0) {
            loadedImages.push(imgEl);
            resolve(imgEl);
        } else {
            imgEl.onload = () => {
                loadedImages.push(imgEl);
                resolve(imgEl);
            };
            imgEl.onerror = () => {
                console.error("Could not load image: ", imgEl.src);
                // Можно добавить "заглушку" или пропустить это изображение
                const placeholder = new Image(100,100); // создаем пустое изображение
                loadedImages.push(placeholder); // добавляем, чтобы Promise.all не упал
                resolve(placeholder); // разрешаем промис с заглушкой
            };
        }
        // На случай если src не установлен или пуст в HTML, и onload никогда не вызовется
        if (!imgEl.src) {
             console.error("Image source is empty for element: ", imgEl.id);
             const placeholder = new Image(100,100);
             loadedImages.push(placeholder);
             resolve(placeholder);
        }
    });
});

Promise.all(loadImagePromises)
    .then(() => {
        console.log("All images loaded (or handled).", loadedImages.length, "images processed.");
        if(loadedImages.filter(img => img.naturalWidth > 0).length === 0){
            console.error("No valid images were loaded. Glitch effect cannot start.");
            // Можно показать сообщение пользователю
            ctx.fillStyle = 'red';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Error: Could not load images for glitch effect.', canvas.width/2, canvas.height/2);
            return;
        }
        setupCanvas();
    })
    .catch(error => {
        console.error("Error loading one or more images:", error);
        // Можно отобразить ошибку на канвасе
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ошибка загрузки :(', canvas.width/2, canvas.height/2);
    });


window.addEventListener('resize', () => {
    // Перенастраиваем канвас при ресайзе, если изображения уже загружены
    if (loadedImages.length > 0 && loadedImages.filter(img => img.naturalWidth > 0).length > 0) {
         setupCanvas();
    }
});