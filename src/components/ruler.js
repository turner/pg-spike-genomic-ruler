function initRuler(canvas, chrStartBP, chrEndBP, startBP, endBP) {
    const ctx = canvas.getContext("2d");

    // High-DPI Rendering
    const dpr = window.devicePixelRatio || 1;

    // Chromosome Length
    const totalBases = chrEndBP - chrStartBP;

    // Current visible range (sub-range)
    let visibleStart = startBP;
    let visibleEnd = endBP;

    // Zoom and panning state
    let isDragging = false;
    let startX = 0;

    function draw() {

        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        const currentUnit = getUnit(visibleEnd - visibleStart)
        const unitScale = currentUnit.value;

        const majorTickSpacing = unitScale;
        const minorTickSpacing = majorTickSpacing / 10;

        ctx.strokeStyle = "#333";
        ctx.fillStyle = "#333";
        ctx.font = `${12 * dpr}px Arial`;
        ctx.textAlign = "center";

        const firstTick = Math.floor(visibleStart / minorTickSpacing) * minorTickSpacing;
        const lastTick = Math.ceil(visibleEnd / minorTickSpacing) * minorTickSpacing;

        const bpp = bpPerPixel(canvas, visibleEnd - visibleStart)
        for (let base = firstTick; base <= lastTick; base += minorTickSpacing) {

            const x = (base - visibleStart) / bpp

            if (x < 0 || x > canvas.clientWidth) continue;

            const isMajor = base % majorTickSpacing === 0;

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, isMajor ? 20 : 10);
            ctx.stroke();

            if (isMajor) {
                const label = `${Math.floor(base / unitScale)} ${currentUnit.name}`;
                ctx.fillText(label, x, 40);
            }
        }
    }

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        // const zoomFactor = 0.1;
        const zoomFactor = 0.008;
        const zoomDelta = e.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;

        const currentSpan = visibleEnd - visibleStart;
        const newSpan = Math.max(100, Math.min(totalBases, currentSpan * zoomDelta));
        const zoomCenter = visibleStart + (e.offsetX / canvas.clientWidth) * currentSpan;

        visibleStart = Math.max(chrStartBP, zoomCenter - (zoomCenter - visibleStart) * zoomDelta);
        visibleEnd = Math.min(chrEndBP, zoomCenter + (visibleEnd - zoomCenter) * zoomDelta);

        draw();
    });

    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.offsetX;
        canvas.style.cursor = "grabbing";
    });

    canvas.addEventListener("mousemove", (e) => {

        if (isDragging) {

            const deltaX = e.offsetX - startX;
            startX = e.offsetX;

            const deltaBP = bpPerPixel(canvas, visibleEnd - visibleStart) * deltaX

            visibleStart = Math.max(chrStartBP, visibleStart - deltaBP);
            visibleEnd = Math.min(chrEndBP, visibleEnd - deltaBP);

            const span = visibleEnd - visibleStart;
            if (visibleStart < chrStartBP) {
                visibleStart = chrStartBP;
                visibleEnd = chrStartBP + span;
            }
            if (visibleEnd > chrEndBP) {
                visibleEnd = chrEndBP;
                visibleStart = chrEndBP - span;
            }

            draw();
        }
    });

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
        canvas.style.cursor = "grab";
    });

    canvas.addEventListener("mouseleave", () => {
        isDragging = false;
        canvas.style.cursor = "grab";
    });

    window.addEventListener("resize", event => {
        resizeScaleCanvas(ctx, dpr)
        draw()
    });

    resizeScaleCanvas(ctx, dpr)
    draw()
}

function bpPerPixel(canvas, spanBP) {
    return spanBP / canvas.clientWidth
}

function resizeScaleCanvas(ctx, dpr) {
    const cssWidth = ctx.canvas.clientWidth;
    const cssHeight = ctx.canvas.clientHeight;

    // Adjust canvas dimensions for high-DPI
    ctx.canvas.width = cssWidth * dpr;
    ctx.canvas.height = cssHeight * dpr;

    // Scale the context to handle high-DPI
    ctx.scale(dpr, dpr);
}

function getUnit(span) {

    const units = [
        { name: "bp", value: 1 },
        { name: "kb", value: 1000 },
        { name: "mb", value: 1000000 },
    ];

    if (span >= 1_000_000) return units[2]; // mb
    if (span >= 1_000) return units[1]; // kb
    return units[0]; // bp;
}

export { initRuler }
