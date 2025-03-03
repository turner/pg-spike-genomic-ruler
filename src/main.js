import './style.scss';
import Ruler from "./components/ruler.js"
import { prettyPrint } from "./utils.js"

document.addEventListener("DOMContentLoaded", (event) => {
    const canvas = document.getElementById("ruler-canvas");
    
    // Initialize ruler without specific genomic coordinates
    const genomicRuler = new Ruler(canvas);

    // Example of how to set a genomic locus (this would come from your widget)
    genomicRuler.setGenomicLocus('chr7', 30000000, 40000000);

    // Listen for genomic locus changes
    canvas.addEventListener('genomicLocusChanged', (event) => {
        const { chr, startBP, endBP } = event.detail;
        console.log(`Genomic locus changed: ${chr}:${prettyPrint(startBP)}-${prettyPrint(endBP)}`);
        // Here you can update other components in your application
    });
});
