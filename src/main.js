import './style.scss';
import Ruler from "./components/ruler.js"
import LocusInput from "./components/locusInput.js"
import { prettyPrint } from "./utils.js"
import { getChromosomeLength } from "./components/genomicUtils.js"

document.addEventListener("DOMContentLoaded", (event) => {
    const canvas = document.getElementById("ruler-canvas");
    const locusContainer = document.getElementById("locus-input-container");
    
    // Initialize ruler without specific genomic coordinates
    const genomicRuler = new Ruler(canvas);

    // Initialize locus input
    const locusInput = new LocusInput(locusContainer, ({ chr, startBP, endBP }) => {
        // If only chromosome is provided, show entire chromosome
        if (!startBP || !endBP) {
            const chrLength = getChromosomeLength(chr);
            genomicRuler.setGenomicLocus(chr, 0, chrLength);
        } else {
            genomicRuler.setGenomicLocus(chr, startBP, endBP);
        }
    });

    // Listen for genomic locus changes
    canvas.addEventListener('genomicLocusChanged', (event) => {
        const { chr, startBP, endBP } = event.detail;
        // Update the input field to reflect the current locus
        locusInput.setValue(`${chr}:${prettyPrint(startBP)}-${prettyPrint(endBP)}`);
        console.log(`Genomic locus changed: ${chr}:${prettyPrint(startBP)}-${prettyPrint(endBP)}`);
    });

    // Set initial locus
    genomicRuler.setGenomicLocus('chr7', 30000000, 40000000);
});
