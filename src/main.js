import './style.scss';
import { initRuler } from './components/ruler.js';
import RulerClass from "./components/rulerClass.js"

document.addEventListener("DOMContentLoaded", (event) => {

    const canvas = document.getElementById("ruler-canvas");
    const renderedExtent =
        {
            startBP: 30000000,
            endBP: 40000000
        }

    const genomicRuler = new RulerClass(canvas, 0, 133324548, renderedExtent)

})
