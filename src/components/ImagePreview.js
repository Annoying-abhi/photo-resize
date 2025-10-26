import React, { useRef, useEffect, useState } from 'react';
import { drawLayoutOnCanvas, loadImage } from '../utils/canvasUtils';
import './ImagePreview.css';

function ImagePreview({ imageSrc, crop, settings }) {
  const canvasRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState('');
  // const [canvasScale, setCanvasScale] = useState(1); // Removed canvasScale state

  useEffect(() => {
    const drawPreview = async () => {
      if (!imageSrc || !crop || !crop.width || !crop.height || !canvasRef.current) {
        const canvas = canvasRef.current;
        if (canvas) {
           const ctx = canvas.getContext('2d');
           if (ctx) {
              canvas.width = 300; // Reset to a default small size
              canvas.height = 150;
              ctx.fillStyle = '#eee';
              ctx.fillRect(0,0, canvas.width, canvas.height);
              ctx.fillStyle = '#999';
              ctx.font = '14px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('Waiting for image and crop...', canvas.width / 2, canvas.height / 2);
           }
        }
        // setCanvasScale(1); // Removed scale update
        return;
      }

      setIsDrawing(true);
      setError('');
      const canvas = canvasRef.current;
      // const container = previewContainerRef.current; // No longer needed for scaling

      try {
        const imageElement = await loadImage(imageSrc);
        // Add log before drawing
        console.log('Drawing layout with:', {
            imageNaturalWidth: imageElement.naturalWidth,
            crop,
            settings
        });
        drawLayoutOnCanvas(canvas, imageElement, crop, settings);

        // --- Removed scale calculation ---
        // if (container && canvas.width > 0) {
        //    const containerWidth = container.clientWidth;
        //    const scale = Math.min(1, (containerWidth - 20) / canvas.width);
        //    setCanvasScale(scale);
        // } else {
        //    setCanvasScale(1);
        // }

      } catch (err) {
        console.error("Error drawing preview:", err);
        setError('Could not generate preview.');
         // setCanvasScale(1); // Removed scale update
      } finally {
        setIsDrawing(false);
      }
    };

    const debounceTimeout = setTimeout(drawPreview, 100);

    return () => clearTimeout(debounceTimeout);

  }, [imageSrc, crop, settings]);

  const handleDownload = (format = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas || error || isDrawing) return;

    // --- Add a check before generating blob ---
    // Ensure canvas has non-transparent content before attempting download
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) {
        setError('Cannot download empty canvas.');
        return;
    }
    // Check a few points for transparency (might not be foolproof for all-white bg)
    const pixelData1 = ctx.getImageData(0, 0, 1, 1).data;
    const pixelData2 = ctx.getImageData(canvasWidth / 2, canvasHeight / 2, 1, 1).data;
    const pixelData3 = ctx.getImageData(canvasWidth - 1, canvasHeight - 1, 1, 1).data;
    if (pixelData1[3] === 0 && pixelData2[3] === 0 && pixelData3[3] === 0) { // Check alpha channel
        console.warn("Canvas appears transparent, download might fail or be empty.");
        // setError('Preview generation failed. Cannot download.'); // Optional: Show error
        // return; // Optional: Stop download if likely empty
    }
    // --- End check ---


    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.95 : undefined;

    canvas.toBlob((blob) => {
      if (blob) {
         try {
           if (window.saveAs) { // Use FileSaver.js if available
             window.saveAs(blob, `print_layout.${format}`);
           } else { // Fallback method
              const link = document.createElement('a');
              link.download = `print_layout.${format}`;
              link.href = URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
           }
         } catch (err) {
            console.error("Download failed:", err);
            setError('Download failed. Please try again.');
         }
      } else {
         setError('Failed to create image blob for download.');
         console.error('Canvas toBlob failed. Canvas dimensions:', canvas.width, 'x', canvas.height);
         // Add more context if possible
         if (canvas.width > 8000 || canvas.height > 8000) {
            console.error("Canvas dimensions might be too large for toBlob in this browser.");
         }
      }
    }, mimeType, quality);
  };


  return (
    <div className="image-preview-wrapper" ref={previewContainerRef}>
      <h2>3. Preview & Download</h2>
      {error && <p className="error-message">{error}</p>}
      {isDrawing && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating Preview...</p>
        </div>
      )}
      <div className={`preview-box ${isDrawing ? 'hidden' : ''}`}>
        <canvas
            ref={canvasRef}
            style={{
               // Force width to 100%, height auto
               width: '100%',
               height: 'auto',
               maxWidth: '100%', // Still needed
               border: '1px dashed #ccc',
               borderRadius: '4px',
               display: (isDrawing || !crop || !crop.width || !crop.height) ? 'none' : 'block'
            }}
         />
         {(!isDrawing && (!crop || !crop.width || !crop.height) && imageSrc) && (
              <div className="loading-container" style={{ minHeight: '150px' }}>
                 <p>Adjust crop selection to generate preview.</p>
              </div>
         )}
      </div>

       {!isDrawing && !error && crop?.width && crop?.height && (
         <div className="button-group">
            <button onClick={() => handleDownload('png')} className="btn btn-primary btn-download">
               Download PNG
            </button>
            <button onClick={() => handleDownload('jpg')} className="btn btn-secondary">
               Download JPG
            </button>
         </div>
       )}
    </div>
  );
}

export default ImagePreview;