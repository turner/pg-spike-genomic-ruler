import {prettyPrint} from "../utils.js"

class RulerClass {

    constructor(canvas, chrStartBP, chrEndBP, renderedExtentBP) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.chrStartBP = chrStartBP;
        this.chrEndBP = chrEndBP;
        this.renderedExtentBP = { ...renderedExtentBP }; // Clone to avoid side-effects
        this.dpr = window.devicePixelRatio || 1;

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

        const zoomCenter = this.renderedExtentBP.startBP +
            (e.offsetX / this.canvas.clientWidth) * (this.renderedExtentBP.endBP - this.renderedExtentBP.startBP);

        this.renderedExtentBP.startBP = Math.max(
            this.chrStartBP,
            zoomCenter - (zoomCenter - this.renderedExtentBP.startBP) * zoomDelta
        );
        this.renderedExtentBP.endBP = Math.min(
            this.chrEndBP,
            zoomCenter + (this.renderedExtentBP.endBP - zoomCenter) * zoomDelta
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

        this.renderedExtentBP.startBP = Math.max(this.chrStartBP, this.renderedExtentBP.startBP - deltaBP);
        this.renderedExtentBP.endBP = Math.min(this.chrEndBP, this.renderedExtentBP.endBP - deltaBP);

        const span = this.renderedExtentBP.endBP - this.renderedExtentBP.startBP;

        if (this.renderedExtentBP.startBP < this.chrStartBP) {
            this.renderedExtentBP.startBP = this.chrStartBP;
            this.renderedExtentBP.endBP = this.chrStartBP + span;
        }

        if (this.renderedExtentBP.endBP > this.chrEndBP) {
            this.renderedExtentBP.endBP = this.chrEndBP;
            this.renderedExtentBP.startBP = this.chrEndBP - span;
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
        return (this.renderedExtentBP.endBP - this.renderedExtentBP.startBP) / this.canvas.clientWidth;
    }

    draw() {
        this.clearCanvas();

        const spanBP = this.renderedExtentBP.endBP - this.renderedExtentBP.startBP;
        const bpp = this.bpPerPixel();
        const unit = RulerClass.getUnit(spanBP);
        const majorTickSpacing = RulerClass.getTickSpacing(spanBP, this.canvas.clientWidth);
        const minorTickSpacing = majorTickSpacing / 10;

        const firstTickBP = Math.floor(this.renderedExtentBP.startBP / minorTickSpacing) * minorTickSpacing;
        const lastTickBP = Math.ceil(this.renderedExtentBP.endBP / minorTickSpacing) * minorTickSpacing;

        this.ctx.strokeStyle = "#333";
        this.ctx.fillStyle = "#333";
        this.ctx.font = `${12 * this.dpr}px Arial`;
        this.ctx.textAlign = "center";

        // console.log(`locus: chrXX:${ prettyPrint(this.renderedExtentBP.startBP) }-${ prettyPrint(this.renderedExtentBP.endBP) }`);

        for (let bp = firstTickBP; bp <= lastTickBP; bp += minorTickSpacing) {
            const x = (bp - this.renderedExtentBP.startBP) / bpp;

            if (x < 0 || x > this.canvas.clientWidth) continue;

            const isMajor = bp % majorTickSpacing === 0;

            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, isMajor ? 20 : 10);
            this.ctx.stroke();

            if (isMajor) {
                const label = `${prettyPrint(Math.floor(bp / unit.value))} ${unit.name}`;
                this.ctx.fillText(label, x, 40);
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
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

        const magnitude = Math.pow(10, Math.floor(Math.log10(rawSpacing)));
        return Math.ceil(rawSpacing / magnitude) * magnitude;
    }

}

export default RulerClass
