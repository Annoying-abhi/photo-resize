import { printSizes, paperSizes } from './presets';

// Constants
const PRINT_DPI = 300;
const INCH_TO_MM = 25.4;
const MM_TO_INCH = 1 / INCH_TO_MM;
const CM_TO_INCH = 1 / (INCH_TO_MM / 10);

// Helper Functions
function toPixels(dimension, unit, dpi) {
  let inches = dimension;
  if (unit === 'cm') inches = dimension * CM_TO_INCH;
  return Math.round(inches * dpi);
}

function calculateLayout(paperW, paperH, photoW, photoH, margin) {
  if (photoW <= 0 || photoH <= 0) return { cols: 0, rows: 0 };
  const cols = Math.floor((paperW + margin) / (photoW + margin));
  const rows = Math.floor((paperH + margin) / (photoH + margin));
  return { cols, rows, total: cols * rows };
}

export function drawLayoutOnCanvas(canvas, image, crop, settings) {
  // --- Essential Data Validation ---
  if (!canvas || !image || image.naturalWidth === 0 || !crop || crop.width <= 0 || crop.height <= 0 || !settings) {
    console.error("drawLayoutOnCanvas: Invalid arguments provided.", { canvas, image, crop, settings });
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      canvas.width = 300; canvas.height = 150;
      ctx.fillStyle = '#eee'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#999'; ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Error: Cannot generate preview.', canvas.width / 2, canvas.height / 2);
    }
    return;
  }

  const { printSizeKey, customWidth, customHeight, unit, paperSizeKey, margin: marginMM } = settings;
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error("Could not get canvas context"); return; }

  // --- 1. Get Dimensions in Pixels ---
  const paper = paperSizes[paperSizeKey];
  const paperWidthPX = toPixels(paper.width * MM_TO_INCH, 'in', PRINT_DPI);
  const paperHeightPX = toPixels(paper.height * MM_TO_INCH, 'in', PRINT_DPI);
  const marginPX = toPixels(marginMM * MM_TO_INCH, 'in', PRINT_DPI);

  let photoWidthCM, photoHeightCM;
  if (printSizeKey === 'custom') {
    photoWidthCM = unit === 'cm' ? customWidth : customWidth * INCH_TO_MM / 10;
    photoHeightCM = unit === 'cm' ? customHeight : customHeight * INCH_TO_MM / 10;
  } else {
    const preset = printSizes[printSizeKey];
    photoWidthCM = preset.unit === 'cm' ? preset.width : preset.width * INCH_TO_MM / 10;
    photoHeightCM = preset.unit === 'cm' ? preset.height : preset.height * INCH_TO_MM / 10;
  }
  const photoWidthPX = toPixels(photoWidthCM * CM_TO_INCH, 'in', PRINT_DPI);
  const photoHeightPX = toPixels(photoHeightCM * CM_TO_INCH, 'in', PRINT_DPI);

  if (photoWidthPX <= 0 || photoHeightPX <= 0) {
      console.error("Invalid photo dimensions calculated:", photoWidthPX, photoHeightPX);
      // Optional: Draw error on canvas
      return;
  }

  // --- 2. Setup Canvas ---
  canvas.width = paperWidthPX;
  canvas.height = paperHeightPX;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, paperWidthPX, paperHeightPX);

  // --- 3. Calculate Best Layout (Original vs Rotated) ---
  const layoutOriginal = calculateLayout(paperWidthPX, paperHeightPX, photoWidthPX, photoHeightPX, marginPX);
  // Calculate layout for rotated photo (swap width/height)
  const layoutRotated = calculateLayout(paperWidthPX, paperHeightPX, photoHeightPX, photoWidthPX, marginPX);

  let bestLayout;
  let drawWidthPX, drawHeightPX;
  let rotatePhoto = false;

  // Choose layout that fits more photos, prioritize original orientation if equal
  if (layoutRotated.total > layoutOriginal.total) {
    bestLayout = layoutRotated;
    drawWidthPX = photoHeightPX; // Rotated width is original height
    drawHeightPX = photoWidthPX; // Rotated height is original width
    rotatePhoto = true;
    console.log("Using rotated layout.");
  } else {
    bestLayout = layoutOriginal;
    drawWidthPX = photoWidthPX;
    drawHeightPX = photoHeightPX;
    rotatePhoto = false;
    console.log("Using original layout.");
  }

  const { cols, rows, total: totalPhotos } = bestLayout;

  if (cols <= 0 || rows <= 0) {
    ctx.fillStyle = 'gray'; ctx.font = `${Math.min(paperWidthPX / 10, 30)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Photo size too large for paper.', canvas.width / 2, canvas.height / 2);
    return;
  }

  console.log(`Layout Result: ${cols} columns x ${rows} rows = ${totalPhotos} photos. Rotated: ${rotatePhoto}`);

  const totalGridWidth = cols * drawWidthPX + Math.max(0, cols - 1) * marginPX;
  const totalGridHeight = rows * drawHeightPX + Math.max(0, rows - 1) * marginPX;
  const startX = Math.max(0, (paperWidthPX - totalGridWidth) / 2);
  const startY = Math.max(0, (paperHeightPX - totalGridHeight) / 2);

  // --- 4. Draw Images ---
  console.log(`Attempting to draw ${totalPhotos} images.`);
  ctx.save(); // Save context state before potential rotations

  // Pre-calculate source crop values, ensure they are integers and within bounds
  const sx = Math.max(0, Math.round(crop.x));
  const sy = Math.max(0, Math.round(crop.y));
  const sWidth = Math.max(1, Math.round(crop.width));
  const sHeight = Math.max(1, Math.round(crop.height));

  // Check if crop dimensions exceed image dimensions
  if (sx + sWidth > image.naturalWidth || sy + sHeight > image.naturalHeight) {
      console.warn("Crop area exceeds image bounds. Clamping crop.", {
          sx, sy, sWidth, sHeight, imgW: image.naturalWidth, imgH: image.naturalHeight
      });
      // Optionally adjust sWidth/sHeight here, though drawImage might handle it
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const drawX = Math.round(startX + c * (drawWidthPX + marginPX));
      const drawY = Math.round(startY + r * (drawHeightPX + marginPX));

      ctx.save(); // Save context for each image draw (especially important for rotation)
      ctx.beginPath(); // Start a new path for clipping
      ctx.rect(drawX, drawY, drawWidthPX, drawHeightPX); // Define clipping rectangle
      ctx.clip(); // Apply clipping

      try {
        if (rotatePhoto) {
          // Translate to center of where image will be, rotate, translate back
          ctx.translate(drawX + drawWidthPX / 2, drawY + drawHeightPX / 2);
          ctx.rotate(90 * Math.PI / 180); // Rotate 90 degrees clockwise
          ctx.drawImage(
            image,
            sx, sy, sWidth, sHeight, // Source crop rectangle
            -drawHeightPX / 2, -drawWidthPX / 2, // Adjust destination position for rotation
            drawHeightPX, drawWidthPX // Swap destination width/height
          );
        } else {
          ctx.drawImage(
            image,
            sx, sy, sWidth, sHeight, // Source crop rectangle
            drawX, drawY, // Destination position
            drawWidthPX, drawHeightPX // Destination size
          );
        }
      } catch (drawError) {
        console.error(`Error drawing image #${r * cols + c + 1} at (${drawX}, ${drawY}):`, drawError);
        // Draw red X on error
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX + drawWidthPX, drawY + drawHeightPX);
        ctx.moveTo(drawX + drawWidthPX, drawY);
        ctx.lineTo(drawX, drawY + drawHeightPX);
        ctx.stroke();
      } finally {
        ctx.restore(); // Restore context (removes clip and rotation)
      }
    }
  }
  ctx.restore(); // Restore original context state
}

// loadImage function remains the same as before
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
        reject(new Error("Image URL is empty"));
        return;
    }
    const img = new Image();
    img.onload = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            console.error("Image loaded but has zero dimensions. URL:", url.substring(0, 100) + "...");
            reject(new Error("Image loaded with zero dimensions"));
        } else {
            resolve(img);
        }
    };
    img.onerror = (err) => {
      console.error("Failed to load image:", url.substring(0, 100) + "...", err);
      reject(err);
    };
    img.src = url;
  });
}