import {prettyPrint} from "./genomicUtils.js"
import {getChromosomeLength} from "./genomicUtils.js"

let lastExecutionTime = 0
const delay = 16 // 60 fps

class Ruler {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.dpr = window.devicePixelRatio || 1;

        // Initialize with null values
        this.chr = null;
        this.genomicExtent = null;

        this.isDragging = false;
        this.startX = 0;

        this.init();
    }

    init() {
        // Set up event listeners
        this.canvas.addEventListener("wheel", this.handleZoom.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("mouseleave", this.handleMouseUp.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));

        // Initial render
        this.resizeCanvas();
        this.draw();
    }

    // New method to set genomic locus
    setGenomicLocus(chr, startBP, endBP) {
        this.chr = chr;
        const { start: chrStart, end: chrEnd } = Ruler.getChromosomeBoundaries(chr);

        // Validate and clamp the provided range
        startBP = Math.max(chrStart, Math.min(startBP, chrEnd));
        endBP = Math.max(chrStart, Math.min(endBP, chrEnd));

        // Ensure minimum visible range (e.g., 100bp)
        const minRange = 100;
        if (endBP - startBP < minRange) {
            const center = (startBP + endBP) / 2;
            startBP = center - minRange / 2;
            endBP = center + minRange / 2;
        }

        this.genomicExtent = { startBP, endBP };

        this.draw();

        // Dispatch event for parent application
        this.dispatchLocusChangedEvent(chr, this.genomicExtent);
    }

    static getChromosomeBoundaries(chr) {
        return {
            start: 0,
            end: getChromosomeLength(chr)
        };
    }

    handleZoom(e) {
        e.preventDefault();

        const zoomFactor = 0.008;
        const zoomDelta = e.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;
        const { start: chrStart, end: chrEnd } = Ruler.getChromosomeBoundaries(this.chr);

        const zoomCenter =
            this.genomicExtent.startBP +
            (e.offsetX / this.canvas.clientWidth) *
            (this.genomicExtent.endBP - this.genomicExtent.startBP);

        this.genomicExtent.startBP = Math.max(
            chrStart,
            zoomCenter - (zoomCenter - this.genomicExtent.startBP) * zoomDelta
        );
        this.genomicExtent.endBP = Math.min(
            chrEnd,
            zoomCenter + (this.genomicExtent.endBP - zoomCenter) * zoomDelta
        );

        this.draw();
        this.dispatchLocusChangedEvent(this.chr, this.genomicExtent);
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.startX = e.offsetX;
        this.canvas.style.cursor = "grabbing";
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.offsetX - this.startX;
        this.startX = e.offsetX;

        const deltaBP = this.bpPerPixel() * deltaX;
        const { start: chrStart, end: chrEnd } = Ruler.getChromosomeBoundaries(this.chr);

        this.genomicExtent.startBP = Math.max(
            chrStart,
            this.genomicExtent.startBP - deltaBP
        );
        this.genomicExtent.endBP = Math.min(
            chrEnd,
            this.genomicExtent.endBP - deltaBP
        );

        const span = this.genomicExtent.endBP - this.genomicExtent.startBP;

        if (this.genomicExtent.startBP < chrStart) {
            this.genomicExtent.startBP = chrStart;
            this.genomicExtent.endBP = chrStart + span;
        }

        if (this.genomicExtent.endBP > chrEnd) {
            this.genomicExtent.endBP = chrEnd;
            this.genomicExtent.startBP = chrEnd - span;
        }

        this.draw();
        this.dispatchLocusChangedEvent(this.chr, this.genomicExtent);
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = "grab";
    }

    handleResize() {
        this.resizeCanvas();
        this.draw();
    }

    resizeCanvas() {
        const cssWidth = this.canvas.clientWidth;
        const cssHeight = this.canvas.clientHeight;

        // Adjust canvas dimensions for high-DPI
        this.canvas.width = cssWidth * this.dpr;
        this.canvas.height = cssHeight * this.dpr;

        // Scale the context to handle high-DPI
        this.ctx.scale(this.dpr, this.dpr);
    }

    bpPerPixel() {
        return (
            (this.genomicExtent.endBP - this.genomicExtent.startBP) /
            this.canvas.clientWidth
        );
    }

    draw() {
        // Only draw if we have valid genomic state
        if (!this.genomicExtent) {
            this.clearCanvas();
            return;
        }

        const now = performance.now()
        if (now - lastExecutionTime < delay) {
            return
        }

        this.clearCanvas();

        const spanBP = this.genomicExtent.endBP - this.genomicExtent.startBP;
        const bpp = this.bpPerPixel();
        const unit = Ruler.getUnit(spanBP);
        const majorTickSpacing = Ruler.getTickSpacing(spanBP, this.canvas.clientWidth);
        const minorTickSpacing = majorTickSpacing / 10;

        const firstTickBP = Math.floor(this.genomicExtent.startBP / minorTickSpacing) * minorTickSpacing;
        const lastTickBP = Math.ceil(this.genomicExtent.endBP / minorTickSpacing) * minorTickSpacing;

        this.ctx.strokeStyle = "#333";
        this.ctx.fillStyle = "#333";
        this.ctx.font = `${12 * this.dpr}px Arial`;
        this.ctx.textAlign = "center";

        for (let bp = firstTickBP; bp <= lastTickBP; bp += minorTickSpacing) {
            const x = (bp - this.genomicExtent.startBP) / bpp;

            if (x < 0 || x > this.canvas.clientWidth) continue;

            const isMajor = bp % majorTickSpacing === 0;

            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, isMajor ? 20 : 10);
            this.ctx.stroke();

            if (isMajor) {
                const label = `${prettyPrint(
                    Math.floor(bp / unit.value)
                )} ${unit.name}`;
                this.ctx.fillText(label, x, 40);
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#f5f5f5";
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }

    static getUnit(spanBP) {
        const units = [
            { name: "bp", value: 1 },
            { name: "kb", value: 1000 },
            { name: "mb", value: 1000000 },
        ];

        if (spanBP >= 5e6) return units[2]; // mb
        if (spanBP >= 5e3) return units[1]; // kb
        return units[0]; // bp
    }

    static getTickSpacing(spanBP, canvasWidth) {
        const idealTickCount = 10;
        const bpp = spanBP / canvasWidth;

        const rawSpacing = bpp * canvasWidth / idealTickCount;
        const rawSpacingRound = Math.round(rawSpacing)

        const magnitude = Math.pow(10, Math.floor(Math.log10(rawSpacingRound)))
        return Math.ceil(rawSpacingRound / magnitude) * magnitude;
    }

    // Helper method to dispatch the genomicLocusChanged event
    dispatchLocusChangedEvent(chr, genomicExtent) {
        const { startBP, endBP } = genomicExtent;
        this.canvas.dispatchEvent(new CustomEvent('genomicLocusChanged', { detail: { chr, startBP, endBP } }));
    }
}

export default Ruler
