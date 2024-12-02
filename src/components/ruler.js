function initRuler(canvas, chrStartBP, chrEndBP, renderedExtentBP) {

    const ctx = canvas.getContext("2d");

    // High-DPI Rendering
    const dpr = window.devicePixelRatio || 1;

    // Zoom and panning state
    let isDragging = false;
    let startX = 0;

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        // const zoomFactor = 0.1;
        const zoomFactor = 0.008;
        const zoomDelta = e.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;

        const zoomCenter = renderedExtentBP.startBP + (e.offsetX / canvas.clientWidth) * (renderedExtentBP.endBP - renderedExtentBP.startBP);

        renderedExtentBP.startBP = Math.max(chrStartBP, zoomCenter - (zoomCenter - renderedExtentBP.startBP) * zoomDelta);
        renderedExtentBP.endBP = Math.min(chrEndBP, zoomCenter + (renderedExtentBP.endBP - zoomCenter) * zoomDelta);

        draw(ctx, renderedExtentBP, dpr)
    })

    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.offsetX;
        canvas.style.cursor = "grabbing";
    })

    canvas.addEventListener("mousemove", (e) => {

        if (isDragging) {

            const deltaX = e.offsetX - startX;
            startX = e.offsetX;

            const deltaBP = bpPerPixel(canvas.clientWidth, renderedExtentBP.endBP - renderedExtentBP.startBP) * deltaX

            renderedExtentBP.startBP = Math.max(chrStartBP, renderedExtentBP.startBP - deltaBP);
            renderedExtentBP.endBP = Math.min(chrEndBP, renderedExtentBP.endBP - deltaBP);

            const span = renderedExtentBP.endBP - renderedExtentBP.startBP;
            if (renderedExtentBP.startBP < chrStartBP) {
                renderedExtentBP.startBP = chrStartBP;
                renderedExtentBP.endBP = chrStartBP + span;
            }
            if (renderedExtentBP.endBP > chrEndBP) {
                renderedExtentBP.endBP = chrEndBP;
                renderedExtentBP.startBP = chrEndBP - span;
            }

            draw(ctx, renderedExtentBP, dpr)
        }
    })

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
        canvas.style.cursor = "grab";
    })

    canvas.addEventListener("mouseleave", () => {
        isDragging = false;
        canvas.style.cursor = "grab";
    })

    window.addEventListener("resize", event => {
        resizeScaleCanvas(ctx, dpr)
        draw(ctx, renderedExtentBP, dpr)
    })

    resizeScaleCanvas(ctx, dpr)
    draw(ctx, renderedExtentBP, dpr)
}

function draw(ctx, renderedExtentBP, dpr) {

    clearCanvas(ctx, dpr)

    const unit = getUnit(renderedExtentBP.endBP - renderedExtentBP.startBP)

    const majorTickSpacing = unit.value;
    const minorTickSpacing = majorTickSpacing / 10;

    const firstTickBP = Math.floor(renderedExtentBP.startBP / minorTickSpacing) * minorTickSpacing;
    const lastTickBP = Math.ceil(renderedExtentBP.endBP / minorTickSpacing) * minorTickSpacing;

    ctx.strokeStyle = "#333";
    ctx.fillStyle = "#333";
    ctx.font = `${12 * dpr}px Arial`;
    ctx.textAlign = "center";

    const canvas = ctx.canvas

    const bpp = bpPerPixel(canvas.clientWidth, renderedExtentBP.endBP - renderedExtentBP.startBP)

    for (let bp = firstTickBP; bp <= lastTickBP; bp += minorTickSpacing) {

        const x = (bp - renderedExtentBP.startBP) / bpp

        if (x < 0 || x > canvas.clientWidth) continue;

        const isMajor = bp % majorTickSpacing === 0;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, isMajor ? 20 : 10);
        ctx.stroke();

        if (isMajor) {
            const label = `${Math.floor(bp / unit.value)} ${unit.name}`;
            ctx.fillText(label, x, 40);
        }
    }
}

function clearCanvas(ctx, dpr) {

    const canvas = ctx.canvas
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

}

function bpPerPixel(canvasWidth, spanBP) {
    return spanBP / canvasWidth
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
