import {prettyPrint} from "../utils.js"

let lastExecutionTime = 0
const delay = 16 // 60 fps
// const delay = 64

class Ruler {

    constructor(canvas, chrStartBP, chrEndBP, genomicState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.dpr = window.devicePixelRatio || 1;

        // Initial chromosome and genomic state
        this.chrStartBP = chrStartBP;
        this.chrEndBP = chrEndBP;
        this.genomicState = { ...genomicState }; // Clone to avoid side-effects

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

    handleZoom(e) {
        e.preventDefault();

        const zoomFactor = 0.008;
        const zoomDelta = e.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;

        const zoomCenter =
            this.genomicState.startBP +
            (e.offsetX / this.canvas.clientWidth) *
            (this.genomicState.endBP - this.genomicState.startBP);

        this.genomicState.startBP = Math.max(
            this.chrStartBP,
            zoomCenter - (zoomCenter - this.genomicState.startBP) * zoomDelta
        );
        this.genomicState.endBP = Math.min(
            this.chrEndBP,
            zoomCenter + (this.genomicState.endBP - zoomCenter) * zoomDelta
        );

        this.draw();
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

        this.genomicState.startBP = Math.max(
            this.chrStartBP,
            this.genomicState.startBP - deltaBP
        );
        this.genomicState.endBP = Math.min(
            this.chrEndBP,
            this.genomicState.endBP - deltaBP
        );

        const span = this.genomicState.endBP - this.genomicState.startBP;

        if (this.genomicState.startBP < this.chrStartBP) {
            this.genomicState.startBP = this.chrStartBP;
            this.genomicState.endBP = this.chrStartBP + span;
        }

        if (this.genomicState.endBP > this.chrEndBP) {
            this.genomicState.endBP = this.chrEndBP;
            this.genomicState.startBP = this.chrEndBP - span;
        }

        this.draw();
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
            (this.genomicState.endBP - this.genomicState.startBP) /
            this.canvas.clientWidth
        );
    }

    draw() {

        const now = performance.now()
        if (now - lastExecutionTime < delay) {
            return
        }

        this.clearCanvas();

        const spanBP = this.genomicState.endBP - this.genomicState.startBP;
        const bpp = this.bpPerPixel();
        const unit = Ruler.getUnit(spanBP);
        const majorTickSpacing = Ruler.getTickSpacing(spanBP, this.canvas.clientWidth);
        const minorTickSpacing = majorTickSpacing / 10;

        const firstTickBP =
            Math.floor(this.genomicState.startBP / minorTickSpacing) *
            minorTickSpacing;
        const lastTickBP =
            Math.ceil(this.genomicState.endBP / minorTickSpacing) *
            minorTickSpacing;

        this.ctx.strokeStyle = "#333";
        this.ctx.fillStyle = "#333";
        this.ctx.font = `${12 * this.dpr}px Arial`;
        this.ctx.textAlign = "center";

        for (let bp = firstTickBP; bp <= lastTickBP; bp += minorTickSpacing) {
            const x = (bp - this.genomicState.startBP) / bpp;

            if (x < 0 || x > this.canvas.clientWidth) continue;

            const isMajor = bp % majorTickSpacing === 0;

            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, isMajor ? 20 : 10);
            this.ctx.stroke();

            if (isMajor) {
                const label = `${Ruler.prettyPrint(
                    Math.floor(bp / unit.value)
                )} ${unit.name}`;
                this.ctx.fillText(label, x, 40);
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width / this.dpr,
            this.canvas.height / this.dpr
        );
        this.ctx.fillStyle = "#f5f5f5";
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }

    // Method to update chromosome and genomic state
    setChromosome(chrStartBP, chrEndBP, genomicState) {
        this.chrStartBP = chrStartBP;
        this.chrEndBP = chrEndBP;
        this.genomicState = { ...genomicState }; // Clone for safety
        this.draw();
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
        // console.log(`rawSpacing ${ rawSpacing } rawSpacingRound ${ rawSpacingRound }`)

        const magnitude = Math.pow(10, Math.floor(Math.log10(rawSpacingRound)))
        return Math.ceil(rawSpacingRound / magnitude) * magnitude;

    }

    static prettyPrint(value) {
        return value.toLocaleString(); // Adds commas for readability
    }
}

export default Ruler
