import './style.scss';
import { initRuler } from './components/ruler';

document.addEventListener("DOMContentLoaded", (event) => {

    const canvas = document.getElementById("ruler-canvas");
    initRuler(
        canvas,
        0, // Overall range start (chromosome start)
        133324548, // Overall range end (chromosome end)
        30000000, // Initial visible range start
        40000000 // Initial visible range end
    );


})
