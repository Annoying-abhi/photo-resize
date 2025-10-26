import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  // Crop, // Using Crop type requires explicit import if needed
  // PixelCrop, // Using PixelCrop type requires explicit import if needed
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // Import default styles
import './ImageCropper.css'; // Custom styles

// Function to get initial crop centered with aspect ratio
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        // Start with a 90% selection area in the center
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function ImageCropper({
  imageSrc, // The Data URL of the image
  aspect, // The desired aspect ratio (e.g., 3.5 / 4.5)
  onCropComplete, // Callback with the completed crop in pixels
  onImageLoad, // Callback when image element loads
}) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(); // Crop state in percentage/pixels as handled by react-image-crop
  const [completedCrop, setCompletedCrop] = useState(null); // Completed crop in pixels

  // --- Refs to store scaling factors ---
  const scaleXRef = useRef(1);
  const scaleYRef = useRef(1);
  // --- End refs ---


  // Effect to set initial crop when aspect ratio or image source changes
  useEffect(() => {
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      const newCrop = centerAspectCrop(width, height, aspect);
      setCrop(newCrop);
      // Also set the completed crop initially after a short delay to ensure rendering
       setTimeout(() => setCompletedCrop(newCrop), 50) ;
    }
  }, [aspect, imageSrc]); // Re-run when aspect or image changes

  // Handler when the image element loads
  const handleImageLoad = (e) => {
    onImageLoad?.(e); // Notify parent if needed
    
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;

    // --- Calculate and store scaling factors ---
    scaleXRef.current = naturalWidth / width;
    scaleYRef.current = naturalHeight / height;
    // --- End scaling calculation ---

    if (aspect) {
       const initialPixelCrop = centerAspectCrop(width, height, aspect);
       setCrop(initialPixelCrop); // Set the crop state for ReactCrop
       setCompletedCrop(initialPixelCrop); // Set our completed state (relative to displayed size)

       // --- Calculate and send the initial SCALED crop to the parent ---
       const scaledCrop = {
         x: initialPixelCrop.x * scaleXRef.current,
         y: initialPixelCrop.y * scaleYRef.current,
         width: initialPixelCrop.width * scaleXRef.current,
         height: initialPixelCrop.height * scaleYRef.current,
       };
       // Trigger the callback once on load with initial SCALED crop
       onCropComplete(scaledCrop);
    }
  };

  // Handler for when the crop interaction is complete
  const handleCropComplete = (pixelCrop) => {
     setCompletedCrop(pixelCrop); // Update internal state (relative to displayed size)

     // --- Scale the completed crop before sending to parent ---
     const scaledCrop = {
       x: pixelCrop.x * scaleXRef.current,
       y: pixelCrop.y * scaleYRef.current,
       width: pixelCrop.width * scaleXRef.current,
       height: pixelCrop.height * scaleYRef.current,
     };
     // --- End scaling ---

     // Only call onCropComplete if the crop is valid
     if (scaledCrop.width && scaledCrop.height) {
        onCropComplete(scaledCrop); // Notify parent component (HomePage) with SCALED pixels
     }
  };


  return (
    <div className="image-cropper-wrapper">
      {imageSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)} // Update crop state during interaction
          onComplete={handleCropComplete} // This will now trigger our scaled calculation
          aspect={aspect}
          keepSelection={true}
          className="image-cropper-base"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            alt="Crop me"
            src={imageSrc}
            onLoad={handleImageLoad} // This handler now calculates scale factors
            style={{ transform: 'scale(1)', objectFit: 'contain' }}
          />
        </ReactCrop>
      )}
    </div>
  );
}

export default ImageCropper;