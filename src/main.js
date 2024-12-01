import './style.scss';
import { initRuler } from './components/ruler';

document.addEventListener("DOMContentLoaded", (event) => {

    const canvas = document.getElementById("ruler-canvas");
    initRuler(canvas, 0, 133324548, 30000000, 40000000);


})
