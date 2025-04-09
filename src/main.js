import './styles/app.scss';
import Ruler from "./components/ruler.js"
import LocusInput from "./components/locusInput.js"

document.addEventListener("DOMContentLoaded", (event) => {
    const canvas = document.getElementById("ruler-canvas");

    const genomicRuler = new Ruler(canvas);

    const locusInput = new LocusInput(document.querySelector('.locus-input'), genomicRuler);

    genomicRuler.setGenomicLocus('chr7', 30000000, 40000000);
});
