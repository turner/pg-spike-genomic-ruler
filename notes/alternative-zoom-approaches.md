Great question! Accessibility and usability are critical, especially for users who may not have access to a trackpad or mouse wheel. Here are several alternative approaches to support zooming in and out:

---

### 1. **Keyboard Shortcuts**
Allow users to zoom in and out using keyboard shortcuts, such as `+` and `-` or custom key combinations (e.g., `Ctrl + +` for zoom in and `Ctrl + -` for zoom out).

**Implementation:**
```javascript
document.addEventListener("keydown", (e) => {
    if (e.key === "+" || e.key === "=") {
        zoomIn();
    } else if (e.key === "-") {
        zoomOut();
    }
});

function zoomIn() {
    const zoomFactor = 1 - 0.1; // Adjust zoom factor as needed
    zoom(zoomFactor);
}

function zoomOut() {
    const zoomFactor = 1 + 0.1; // Adjust zoom factor as needed
    zoom(zoomFactor);
}

function zoom(zoomFactor) {
    const canvas = document.querySelector("canvas"); // Adjust selector as needed
    const zoomCenter = renderedExtentBP.startBP + (canvas.clientWidth / 2) * bpPerPixel(canvas.clientWidth, renderedExtentBP.endBP - renderedExtentBP.startBP);

    renderedExtentBP.startBP = Math.max(chrStartBP, zoomCenter - (zoomCenter - renderedExtentBP.startBP) * zoomFactor);
    renderedExtentBP.endBP = Math.min(chrEndBP, zoomCenter + (renderedExtentBP.endBP - zoomCenter) * zoomFactor);

    draw(ctx, renderedExtentBP, window.devicePixelRatio || 1);
}
```

---

### 2. **On-Screen Zoom Buttons**
Provide UI buttons (e.g., `Zoom In` and `Zoom Out`) that users can click to control zooming.

**Implementation:**
```html
<button id="zoom-in">Zoom In</button>
<button id="zoom-out">Zoom Out</button>
```

```javascript
document.getElementById("zoom-in").addEventListener("click", zoomIn);
document.getElementById("zoom-out").addEventListener("click", zoomOut);
```

This method is especially useful for touch interfaces or non-traditional input devices.

---

### 3. **Slider for Zoom Level**
Use a range input (`<input type="range">`) to let users control the zoom level. This provides a continuous zoom control and is intuitive for users accustomed to sliders.

**Implementation:**
```html
<input type="range" id="zoom-slider" min="1" max="10" step="0.1" value="5">
```

```javascript
const zoomSlider = document.getElementById("zoom-slider");

zoomSlider.addEventListener("input", (e) => {
    const zoomFactor = parseFloat(e.target.value) / 5; // Normalize zoom level (adjust as needed)
    zoom(zoomFactor);
});
```

---

### 4. **Context Menu Zoom Options**
Include a right-click context menu with zoom options.

**Implementation:**
```javascript
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.style.backgroundColor = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.padding = "5px";

    menu.innerHTML = `
        <button id="context-zoom-in">Zoom In</button>
        <button id="context-zoom-out">Zoom Out</button>
    `;
    document.body.appendChild(menu);

    document.getElementById("context-zoom-in").addEventListener("click", () => {
        zoomIn();
        document.body.removeChild(menu);
    });

    document.getElementById("context-zoom-out").addEventListener("click", () => {
        zoomOut();
        document.body.removeChild(menu);
    });

    document.addEventListener("click", () => {
        if (menu.parentNode) menu.parentNode.removeChild(menu);
    });
});
```

---

### 5. **Pinch-to-Zoom for Touch Devices**
Support pinch-to-zoom gestures for users on mobile or touch-enabled devices.

**Implementation:**
```javascript
canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const currentDistance = Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);

        if (!canvas.lastDistance) {
            canvas.lastDistance = currentDistance;
        }

        const zoomFactor = currentDistance / canvas.lastDistance;
        zoom(zoomFactor);

        canvas.lastDistance = currentDistance;
    }
});

canvas.addEventListener("touchend", () => {
    canvas.lastDistance = null;
});
```

---

### Recommendations
- **Combine Methods**: Support multiple zoom mechanisms to accommodate diverse user preferences and devices.
- **Provide Feedback**: Indicate the current zoom level (e.g., with a label like "Zoom: 5x").
- **Test Accessibility**: Ensure keyboard navigation and alternative input methods work seamlessly across devices.

Let me know which approach you'd like to focus on, or if you need further assistance integrating these methods! 😊