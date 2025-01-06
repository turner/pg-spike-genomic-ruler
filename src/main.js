import './style.scss';
import Ruler from "./components/ruler.js"

document.addEventListener("DOMContentLoaded", (event) => {

    const canvas = document.getElementById("ruler-canvas");
    const genomicState =
        {
            startBP: 30000000,
            endBP: 40000000
        }

    const genomicRuler = new Ruler(canvas, 0, 133324548, genomicState)

    document.getElementById('switchChromosomeBtn').addEventListener('click', () => {
        const newChrStartBP = 0;
        const newChrEndBP = 5e7; // 50 million base pairs
        const newGenomicState = { startBP: 2e6, endBP: 3e6 }; // New visible region (2M - 3M bp)

        genomicRuler.setChromosome(newChrStartBP, newChrEndBP, newGenomicState);
    });


})
