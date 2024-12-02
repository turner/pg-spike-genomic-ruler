import './style.scss';
import { initRuler } from './components/ruler';

document.addEventListener("DOMContentLoaded", (event) => {

    const canvas = document.getElementById("ruler-canvas");
    const renderedExtent =
        {
            startBP: 30000000,
            endBP: 40000000
        }
    initRuler(canvas, 0, 133324548, renderedExtent);


})
