const sourceImageElements = [
    document.getElementById('sourceImage0'),
    document.getElementById('sourceImage1'),
    document.getElementById('sourceImage2'),
    document.getElementById('sourceImage3'),
];
const loadedImages = [];

const SLICE_COUNT_MIN = 3;
const SLICE_COUNT_MAX = 15;
const SLICE_HEIGHT_MIN = 2;
const SLICE_HEIGHT_MAX = 160;

const HORIZONTAL_DISPLACEMENT_MAX = 10;
const CHANCE_OF_LAYER_DRAW = 0.85;
const GLITCH_FRAME_RATE = 1000 / 8;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializeGlitchForCanvas(canvasElement, allLoadedImages) {
    const canvas = canvasElement;
    if (!canvas) {
        console.error("Canvas element not provided for initialization.");
        return;
    }
    const ctx = canvas.getContext('2d');

    let lastGlitchTime = 0;
    let canvasBaseWidth, canvasBaseHeight;
    let animationFrameId;

    function drawGlitchEffect() {
        const validImages = allLoadedImages.filter(img => img && img.naturalWidth > 0);
        if (validImages.length === 0) {
            // console.warn(`Canvas ${canvas.id}: No valid images available to draw.`);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';

        // Sometime drawing the base layer (less glitched)
        if (Math.random() < 0.5 && validImages.length > 0) {
            const baseImg = validImages[0];
            const sliceY = getRandomInt(0, Math.max(0, baseImg.naturalHeight - SLICE_HEIGHT_MAX));
            let sliceH = getRandomInt(baseImg.naturalHeight / 5, baseImg.naturalHeight / 3);
            if (sliceY + sliceH > baseImg.naturalHeight) sliceH = baseImg.naturalHeight - sliceY;
            if (sliceH > 0 && baseImg.naturalHeight > 0) { // Добавлена проверка baseImg.naturalHeight > 0
                 ctx.drawImage(baseImg, 0, sliceY, baseImg.naturalWidth, sliceH, 0, sliceY * (canvas.height / baseImg.naturalHeight) , canvas.width, sliceH * (canvas.height / baseImg.naturalHeight));
            }
        }

        // Parts of 1 image
        if (Math.random() < CHANCE_OF_LAYER_DRAW && validImages.length > 0) {
            drawRandomSlices(validImages[0], 0.8, HORIZONTAL_DISPLACEMENT_MAX * 0.7, 'rgba(255,80,80,0.05)');
        }

        // Parts of 2 image
        if (Math.random() < CHANCE_OF_LAYER_DRAW && validImages.length > 1) {
            ctx.globalCompositeOperation = 'lighter';
            drawRandomSlices(validImages[1], 0.7, HORIZONTAL_DISPLACEMENT_MAX, 'rgba(80,255,80,0.05)', -1);
            ctx.globalCompositeOperation = 'source-over';
        } else if (Math.random() < CHANCE_OF_LAYER_DRAW && validImages.length > 0) { // Fallback
            ctx.globalCompositeOperation = 'lighter';
            drawRandomSlices(validImages[0], 0.7, HORIZONTAL_DISPLACEMENT_MAX, 'rgba(80,255,80,0.05)', -1);
            ctx.globalCompositeOperation = 'source-over';
        }

        // Parts of 3 image
        if (Math.random() < CHANCE_OF_LAYER_DRAW && validImages.length > 2) {
            ctx.globalCompositeOperation = 'lighter';
            drawRandomSlices(validImages[2], 0.75, HORIZONTAL_DISPLACEMENT_MAX * 1.2, 'rgba(80,80,255,0.05)');
            ctx.globalCompositeOperation = 'source-over';
        } else if (Math.random() < CHANCE_OF_LAYER_DRAW && validImages.length > 0) { // Fallback
             ctx.globalCompositeOperation = 'lighter';
            drawRandomSlices(validImages[0], 0.75, HORIZONTAL_DISPLACEMENT_MAX * 1.2, 'rgba(80,80,255,0.05)');
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Noise Lines
        if (Math.random() < 0.3) {
            addNoiseLines();
        }
    }

    function drawRandomSlices(sourceImage, opacity, maxDisplacement, colorTint = null, displacementDirection = 1) {
        if (!sourceImage || sourceImage.naturalWidth === 0 || sourceImage.naturalHeight === 0) return;

        const numSlices = getRandomInt(SLICE_COUNT_MIN, SLICE_COUNT_MAX);
        const sourceImgWidth = sourceImage.naturalWidth;
        const sourceImgHeight = sourceImage.naturalHeight;

        ctx.globalAlpha = opacity;

        for (let i = 0; i < numSlices; i++) {
            const sourceY = getRandomInt(0, Math.max(0, sourceImgHeight - SLICE_HEIGHT_MIN));
            let sliceHeightOnSource = getRandomInt(SLICE_HEIGHT_MIN, Math.min(SLICE_HEIGHT_MAX, sourceImgHeight - sourceY));
            if (sliceHeightOnSource <= 0) continue;

            const sliceHeightOnCanvas = sliceHeightOnSource * (canvas.height / sourceImgHeight);
            const destYOnCanvas = sourceY * (canvas.height / sourceImgHeight);
            const destX = (Math.random() - 0.5) * 2 * maxDisplacement * displacementDirection;

            ctx.drawImage(
                sourceImage,
                0, sourceY,
                sourceImgWidth, sliceHeightOnSource,
                destX, destYOnCanvas,
                canvas.width, sliceHeightOnCanvas // Paint all the canvas width
            );

            if (colorTint) {
                const originalCompositeOp = ctx.globalCompositeOperation;
                const originalAlpha = ctx.globalAlpha;
                let alphaFromTint = parseFloat(colorTint.split(',')[3] || '0.1');

                ctx.fillStyle = colorTint;
                if (originalCompositeOp !== 'lighter' && originalCompositeOp !== 'screen') {
                    ctx.globalCompositeOperation = 'color';
                }
                ctx.globalAlpha = alphaFromTint;
                ctx.fillRect(destX, destYOnCanvas, canvas.width, sliceHeightOnCanvas);
                ctx.globalCompositeOperation = originalCompositeOp;
                ctx.globalAlpha = opacity;
            }
        }
        ctx.globalAlpha = 1.0; // Reset common opacity for other layers
    }

    function addNoiseLines() {
        if (canvas.width === 0 || canvas.height === 0) return;
        const lines = getRandomInt(5, 20);
        for (let i = 0; i < lines; i++) {
            ctx.fillStyle = `rgba(${getRandomInt(0,255)}, ${getRandomInt(0,255)}, ${getRandomInt(0,255)}, ${Math.random() * 0.3})`;
            ctx.fillRect(
                getRandomInt(-canvas.width * 0.1, canvas.width * 0.9), // May start out of range
                Math.random() * canvas.height,
                getRandomInt(canvas.width * 0.1, canvas.width * 0.5), // Line length
                getRandomInt(1, 3) // Line thickness
            );
        }
    }

    function animationLoop(timestamp) {
        if (timestamp - lastGlitchTime > GLITCH_FRAME_RATE) {
            lastGlitchTime = timestamp;
            drawGlitchEffect();
        }
        animationFrameId = requestAnimationFrame(animationLoop);
    }

    function setupIndividualCanvas() {
        // Use first image size for canvas or default
        const firstValidImage = allLoadedImages.find(img => img && img.naturalWidth > 0) || { naturalWidth: 600, naturalHeight: 400 };
        canvasBaseWidth = firstValidImage.naturalWidth;
        canvasBaseHeight = firstValidImage.naturalHeight;

        const style = getComputedStyle(canvas);
        let cssWidth = parseInt(style.width, 10);
        let cssHeight = parseInt(style.height, 10);

        // Fallback if CSS dimensions are not set or zero
        if (isNaN(cssWidth) || cssWidth <= 0) cssWidth = canvas.width || 300; // Use canvas attribute or default
        if (isNaN(cssHeight) || cssHeight <= 0) cssHeight = canvas.height || 150; // Use canvas attribute or default


        const aspectRatio = (canvasBaseHeight > 0) ? canvasBaseWidth / canvasBaseHeight : 16/9; // Fallback aspect ratio

        if (cssWidth / cssHeight > aspectRatio) {
            canvas.height = cssHeight;
            canvas.width = cssHeight * aspectRatio;
        } else {
            canvas.width = cssWidth;
            canvas.height = cssWidth / aspectRatio;
        }

        // Check if canvas.width and canvas.height != 0
        if (isNaN(canvas.width) || canvas.width <= 0) canvas.width = 300;
        if (isNaN(canvas.height) || canvas.height <= 0) canvas.height = 150;
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        // Clear after first run is size changed
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationLoop(0);
    }

    setupIndividualCanvas();

    const resizeHandler = () => {
        if (allLoadedImages.filter(img => img && img.naturalWidth > 0).length > 0) {
            setupIndividualCanvas();
        }
    };
    window.addEventListener('resize', resizeHandler);
    canvas._glitchResizeHandler = resizeHandler;
}

const loadImagePromises = sourceImageElements.map((imgEl, index) => {
    return new Promise((resolve) => { // Убрал reject, всегда resolve с imgEl или placeholder
        if (!imgEl) {
            console.warn(`Image element with ID sourceImage${index} not found.`);
            const placeholder = new Image(1,1); // Минимальный плейсхолдер
            placeholder.isPlaceholder = true;
            resolve(placeholder);
            return;
        }

        if (imgEl.complete && imgEl.naturalWidth > 0) {
            resolve(imgEl);
        } else {
            imgEl.onload = () => resolve(imgEl);
            imgEl.onerror = () => {
                console.error("Could not load image: ", imgEl.src);
                const placeholder = new Image(1, 1);
                placeholder.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
                placeholder.isPlaceholder = true;
                imgEl.src = placeholder.src;
                imgEl.onload = () => resolve(imgEl);
                imgEl.onerror = () => resolve(new Image(1,1));
            };
        }
        if (!imgEl.src && imgEl.tagName === 'IMG') {
             console.warn("Image source is empty for element: ", imgEl.id);
             const placeholder = new Image(1, 1);
             placeholder.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
             placeholder.isPlaceholder = true;
             imgEl.src = placeholder.src;
             imgEl.onload = () => resolve(imgEl);
             imgEl.onerror = () => resolve(new Image(1,1));
        }
    });
});

Promise.all(loadImagePromises)
    .then(images => {
        images.forEach(img => loadedImages.push(img));

        console.log("All image loading attempts finished.", loadedImages.length, "images processed.");
        const validImageCount = loadedImages.filter(img => img && img.naturalWidth > 0 && !img.isPlaceholder).length;
        console.log(validImageCount, "valid non-placeholder images loaded.");

        if (validImageCount === 0 && loadedImages.filter(img => img && img.naturalWidth > 0).length === 0) {
            console.error("No valid images or placeholders with dimensions were loaded. Glitch effect cannot start.");
            const canvasElements = [document.getElementById('glitchCanvas'), document.getElementById('glitchCanvas2')];
            canvasElements.forEach(canvasEl => {
                if (canvasEl) {
                    const ctx = canvasEl.getContext('2d');
                    if(!canvasEl.width) canvasEl.width = 300; // Устанавливаем дефолтные размеры если их нет
                    if(!canvasEl.height) canvasEl.height = 150;
                    ctx.fillStyle = 'red';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Ошибка загрузки :(', canvasEl.width / 2, canvasEl.height / 2);
                }
            });
            return;
        }

        const canvasElements = [document.getElementById('glitchCanvas'), document.getElementById('glitchCanvas2')];
        canvasElements.forEach(canvasEl => {
            if (canvasEl) {
                initializeGlitchForCanvas(canvasEl, loadedImages); // Передаем ОБЩИЙ массив loadedImages
            } else {
                console.warn("A canvas element specified in canvasElements array was not found in the document.");
            }
        });
    })
    .catch(error => {
        console.error("Critical error during Promise.all (should not happen if promises always resolve):", error);
    });