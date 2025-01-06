import './style.scss';
import Ruler from "./components/ruler.js"
import {getRandomChromosomeName} from "./components/genomicUtils.js"

document.addEventListener("DOMContentLoaded", (event) => {

    const canvas = document.getElementById("ruler-canvas");
    const genomicState =
        {
            startBP: 30000000,
            endBP: 40000000
        }

    const genomicRuler = new Ruler(canvas, 'chr7', genomicState)

    document.getElementById('switchChromosomeBtn').addEventListener('click', () => {

        // New visible region (2M - 3M bp)
        const newGenomicState =
            {
                startBP: 2e6,
                endBP: 3e6
            };

        genomicRuler.setChromosome(getRandomChromosomeName(), newGenomicState);
    });


})
