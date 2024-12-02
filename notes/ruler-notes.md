Certainly! Let’s break down the **ruler drawing algorithm** step-by-step to help you understand how it works. The explanation will focus on key concepts, calculations, and how they translate into what you see on the screen.

---

### **Conceptual Overview**

The ruler is a visual representation of a genomic range, defined by `startBase` and `endBase`. The algorithm translates this genomic range into a visual scale on a `<canvas>`, where the genomic positions (in basepairs, kilobases, or megabases) are mapped to pixels. It supports dynamic panning and adjusts the units (`bp`, `kb`, `mb`) based on how much of the range is visible.

---

### **Core Steps in the Algorithm**

#### 1. **Define the Range and Scale**
The genomic range is defined by `startBase` and `endBase`. The total number of basepairs (`totalBases`) is calculated as:

```javascript
totalBases = endBase - startBase;
```

To map basepairs onto the canvas, the algorithm calculates how many **pixels represent one basepair**:

```javascript
pixelsPerBase = canvas.width / totalBases;
```

This `pixelsPerBase` value ensures that the full genomic range fits within the canvas width.

---

#### 2. **Determine the Visible Range**
As the user pans, the visible range (the part of the genomic range currently displayed) changes. This is calculated using the current `offsetX` (panning position) and `pixelsPerBase`:

```javascript
visibleStart = startBase + -offsetX / pixelsPerBase;
visibleEnd = startBase + (canvas.width - offsetX) / pixelsPerBase;
```

Here’s what happens:
- `-offsetX / pixelsPerBase`: Converts the pixel offset (`offsetX`) to a basepair offset.
- Adding this offset to `startBase` gives the genomic coordinate at the left edge of the canvas (`visibleStart`).
- Similarly, the right edge of the canvas corresponds to `visibleEnd`.

These `visibleStart` and `visibleEnd` values define the genomic positions currently displayed on the canvas.

---

#### 3. **Select the Appropriate Units**
The algorithm dynamically adjusts the units (`bp`, `kb`, or `mb`) based on the span of the visible range (`visibleEnd - visibleStart`):

```javascript
span = visibleEnd - visibleStart;

if (span >= 1_000_000) {
  unit = "mb";
  unitScale = 1_000_000;
} else if (span >= 1_000) {
  unit = "kb";
  unitScale = 1_000;
} else {
  unit = "bp";
  unitScale = 1;
}
```

- **Unit scale** (`unitScale`) defines how many basepairs are in one unit. For example:
  - 1 `kb` = 1,000 basepairs.
  - 1 `mb` = 1,000,000 basepairs.
- The selected unit ensures that tick marks and labels are human-readable and not overcrowded.

---

#### 4. **Calculate Tick Spacing**
Tick marks are drawn at regular intervals to represent genomic positions. The algorithm divides ticks into **major ticks** and **minor ticks**:
- **Major ticks**: Represent significant positions (e.g., every 1 kb, 1 mb).
- **Minor ticks**: Represent smaller divisions between major ticks (e.g., every 100 bp, 100 kb).

The spacing for ticks is calculated based on the `unitScale`:

```javascript
majorTickSpacing = unitScale; // Major tick every 1 unit (e.g., 1 kb)
minorTickSpacing = majorTickSpacing / 10; // Minor tick every 1/10th of a unit
```

---

#### 5. **Draw Ticks and Labels**
The algorithm iterates over genomic positions (`base`) within the visible range (`visibleStart` to `visibleEnd`), incrementing by `minorTickSpacing`. For each position:
1. **Calculate Pixel Position**:
   Convert the genomic position to its corresponding pixel coordinate using:

   ```javascript
   x = (base - startBase) * pixelsPerBase + offsetX;
   ```

   Here:
   - `(base - startBase)` computes the genomic offset of the tick.
   - Multiplying by `pixelsPerBase` converts this genomic offset to pixels.
   - Adding `offsetX` accounts for the panning offset.

2. **Determine Tick Type**:
   - If the position is a multiple of `majorTickSpacing`, it’s a major tick.
   - Otherwise, it’s a minor tick.

3. **Draw the Tick**:
   - Draw a longer line for major ticks and a shorter line for minor ticks:

   ```javascript
   ctx.moveTo(x, 0);
   ctx.lineTo(x, isMajor ? 20 : 10);
   ctx.stroke();
   ```

4. **Add Labels for Major Ticks**:
   For major ticks, display the genomic coordinate converted to the current unit (`bp`, `kb`, `mb`):

   ```javascript
   label = `${Math.floor(base / unitScale)} ${unit}`;
   ctx.fillText(label, x, 40);
   ```

---

#### 6. **Handle Panning**
When the user drags the ruler:
- The `mousemove` event calculates the amount of movement (`deltaX`) and updates the `offsetX` value:

  ```javascript
  offsetX += deltaX;
  ```

- The `offsetX` value is clamped to prevent panning beyond the defined range:

  ```javascript
  offsetX = Math.max(
    Math.min(offsetX, 0),
    -(endBase - startBase) * pixelsPerBase + canvas.width
  );
  ```

- After updating `offsetX`, the `draw()` function is called to re-render the ruler with the new visible range.

---

### **Visualization Example**

Let’s walk through an example:

#### Inputs:
- `startBase = 32,000,000`, `endBase = 36,000,000`.
- Canvas width: 1,000 pixels.

#### Calculations:
1. **Initial Setup**:
   - `totalBases = 36,000,000 - 32,000,000 = 4,000,000 bp`.
   - `pixelsPerBase = 1000 / 4,000,000 = 0.00025 pixels per bp`.

2. **Visible Range (Initial)**:
   - `visibleStart = 32,000,000`.
   - `visibleEnd = 36,000,000`.

3. **Unit Selection**:
   - `span = visibleEnd - visibleStart = 4,000,000 bp`.
   - Unit: `mb` (because `span >= 1,000,000`).
   - `unitScale = 1,000,000 bp`.

4. **Tick Spacing**:
   - `majorTickSpacing = 1 mb = 1,000,000 bp`.
   - `minorTickSpacing = 0.1 mb = 100,000 bp`.

5. **Ticks**:
   - Major ticks: 32mb, 33mb, 34mb, 35mb, 36mb.
   - Minor ticks: Every 100kb within this range.

6. **Pixel Positions**:
   - 32mb: `(32,000,000 - 32,000,000) * 0.00025 = 0 px`.
   - 33mb: `(33,000,000 - 32,000,000) * 0.00025 = 250 px`.
   - And so on.

---

### **Summary**
1. The genomic range is mapped to pixel coordinates using `pixelsPerBase`.
2. The visible range (`visibleStart`, `visibleEnd`) is calculated dynamically based on panning.
3. Units (`bp`, `kb`, `mb`) are selected based on the span of the visible range.
4. Ticks and labels are drawn iteratively, translating genomic positions into pixel positions.

This separation of basepair units and pixel coordinates ensures consistent rendering. Let me know if you have further questions or need clarification!