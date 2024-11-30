function initRuler(canvas, overallStart, overallEnd, initialStart, initialEnd) {
    const ctx = canvas.getContext("2d");

    // Handle high-DPI rendering
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // Set canvas dimensions to account for DPR
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    // Scale the context to match DPR
    ctx.scale(dpr, dpr);

    // Canvas logical dimensions
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    // Overall genomic range
    const totalBases = overallEnd - overallStart;

    // Current visible range (sub-range)
    let visibleStart = initialStart;
    let visibleEnd = initialEnd;

    // Zoom and panning state
    let isDragging = false;
    let startX = 0;

    // Genomic units
    const units = [
        { name: "bp", value: 1 },
        { name: "kb", value: 1000 },
        { name: "mb", value: 1000000 },
    ];

    function calculatePixelsPerBase() {
        return cssWidth / (visibleEnd - visibleStart);
    }

    // Determine the appropriate unit based on visible range
    function getUnit() {
        const span = visibleEnd - visibleStart;
        if (span >= 1_000_000) return units[2]; // mb
        if (span >= 1_000) return units[1]; // kb
        return units[0]; // bp
    }

    // Draw the ruler
    function draw() {
        // Clear the high-DPI canvas
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        const pixelsPerBase = calculatePixelsPerBase();
        const currentUnit = getUnit();
        const unitScale = currentUnit.value;

        // Tick spacing in basepairs
        const majorTickSpacing = unitScale; // Major ticks at each unit (e.g., 1 kb)
        const minorTickSpacing = majorTickSpacing / 10; // Minor ticks between major ticks

        // Draw background
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        // Draw ticks and labels
        ctx.strokeStyle = "#333";
        ctx.fillStyle = "#333";
        ctx.font = `${18 * dpr}px Helvetica`; // Scale font size for high-DPI
        ctx.textAlign = "center";

        const firstTick = Math.floor(visibleStart / minorTickSpacing) * minorTickSpacing;
        const lastTick = Math.ceil(visibleEnd / minorTickSpacing) * minorTickSpacing;

        for (let base = firstTick; base <= lastTick; base += minorTickSpacing) {
            // Calculate the x position in logical pixels
            const x = (base - visibleStart) * pixelsPerBase;

            // Skip ticks outside the canvas
            if (x < 0 || x > cssWidth) continue;

            const isMajor = base % majorTickSpacing === 0;

            // Draw tick
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, isMajor ? 20 : 10);
            ctx.stroke();

            // Draw labels for major ticks
            if (isMajor) {
                const label = `${Math.floor(base / unitScale)} ${currentUnit.name}`;
                ctx.fillText(label, x, 40);
            }
        }
    }

    // Handle zooming
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        const zoomFactor = 0.1;
        const zoomDelta = e.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;

        // Calculate the new visible range
        const currentSpan = visibleEnd - visibleStart;
        const newSpan = Math.max(100, Math.min(totalBases, currentSpan * zoomDelta)); // Minimum span: 100 bp
        const zoomCenter = visibleStart + (e.offsetX / cssWidth) * currentSpan;

        visibleStart = Math.max(overallStart, zoomCenter - (zoomCenter - visibleStart) * zoomDelta);
        visibleEnd = Math.min(overallEnd, zoomCenter + (visibleEnd - zoomCenter) * zoomDelta);

        draw();
    });

    // Handle panning
    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.offsetX;
        canvas.style.cursor = "grabbing";
    });

    canvas.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const deltaX = e.offsetX - startX;
            startX = e.offsetX;

            const pixelsPerBase = calculatePixelsPerBase();
            const baseDelta = deltaX / pixelsPerBase;

            visibleStart = Math.max(overallStart, visibleStart - baseDelta);
            visibleEnd = Math.min(overallEnd, visibleEnd - baseDelta);

            // Clamp panning to overall range
            const span = visibleEnd - visibleStart;
            if (visibleStart < overallStart) {
                visibleStart = overallStart;
                visibleEnd = overallStart + span;
            }
            if (visibleEnd > overallEnd) {
                visibleEnd = overallEnd;
                visibleStart = overallEnd - span;
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

    // Initial draw
    draw();
}

export { initRuler }
