import React, { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import SettingsPanel from '../components/SettingsPanel';
import ImageCropper from '../components/ImageCropper';
import ImagePreview from '../components/ImagePreview'; // Import ImagePreview
import { printSizes, paperSizes } from '../utils/presets';
import './HomePage.css';

// --- Define Default Fixed Margin ---
const FIXED_MARGIN_MM = 1; // Default margin is now 1mm

function HomePage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  // --- Settings State ---
  const defaultPrintSizeKey = 'indianPassport';
  const [printSizeKey, setPrintSizeKey] = useState(defaultPrintSizeKey);
  const [customWidth, setCustomWidth] = useState(printSizes[defaultPrintSizeKey].width);
  const [customHeight, setCustomHeight] = useState(printSizes[defaultPrintSizeKey].height);
  const [unit, setUnit] = useState(printSizes[defaultPrintSizeKey].unit);
  const [paperSizeKey, setPaperSizeKey] = useState('A4');
  // Margin state removed

  // --- Cropping State ---
  const [aspectRatio, setAspectRatio] = useState(printSizes[defaultPrintSizeKey].width / printSizes[defaultPrintSizeKey].height);
  const [completedCrop, setCompletedCrop] = useState(null); // Stores { x, y, width, height } in pixels

  // --- Settings object to pass down ---
  const currentSettings = {
    printSizeKey,
    customWidth,
    customHeight,
    unit,
    paperSizeKey,
    margin: FIXED_MARGIN_MM, // Always pass the fixed margin
  };

  // Effect to update aspect ratio when print size changes
  useEffect(() => {
    let width, height;
    if (printSizeKey === 'custom') {
      width = customWidth;
      height = customHeight;
    } else {
      const preset = printSizes[printSizeKey];
      width = preset.width;
      height = preset.height;
      setCustomWidth(preset.width);
      setCustomHeight(preset.height);
      setUnit(preset.unit);
    }

    if (width > 0 && height > 0) {
      setAspectRatio(width / height);
    } else {
      setAspectRatio(undefined);
    }
  }, [printSizeKey, customWidth, customHeight]);

  const handleImageUpload = (file) => {
    setUploadedImage(file);
    setCompletedCrop(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    console.log("Image uploaded:", file.name);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreviewUrl('');
    setCompletedCrop(null);
    // Reset settings
    setPrintSizeKey(defaultPrintSizeKey);
    setAspectRatio(printSizes[defaultPrintSizeKey].width / printSizes[defaultPrintSizeKey].height);
    setCustomWidth(printSizes[defaultPrintSizeKey].width);
    setCustomHeight(printSizes[defaultPrintSizeKey].height);
    setUnit(printSizes[defaultPrintSizeKey].unit);
    setPaperSizeKey('A4');
    // No margin state to reset
  };

  const handlePrintSizeChange = (key) => {
    setPrintSizeKey(key);
  };

   const handlePaperSizeChange = (key) => {
    setPaperSizeKey(key);
  };

  // handleMarginChange removed

  const handleCropComplete = (pixelCrop) => {
    if (pixelCrop?.width && pixelCrop?.height) {
       console.log("Crop complete (pixels):", pixelCrop);
       setCompletedCrop(pixelCrop);
    } else {
       console.log("Crop incomplete or invalid:", pixelCrop);
       setCompletedCrop(null);
    }
  };


  return (
    <div className="page-container home-page">
      {!uploadedImage ? (
        <>
          <h1>Upload Your Photo</h1>
          <p>Select an image to start arranging for print.</p>
          <ImageUploader onImageUpload={handleImageUpload} />
        </>
      ) : (
        <div className="image-processing-area">
          <div className="cropper-container">
            <h2>Crop Image</h2>
            <ImageCropper
              imageSrc={imagePreviewUrl}
              aspect={aspectRatio}
              onCropComplete={handleCropComplete}
              onImageLoad={() => console.log('Image loaded in cropper')}
            />
             <button onClick={handleRemoveImage} className="remove-button" style={{marginTop: '15px'}}>
              Use Different Image
            </button>
          </div>

          <div className="settings-area">
            <SettingsPanel
              printSizeKey={printSizeKey}
              onPrintSizeChange={handlePrintSizeChange}
              customWidth={customWidth}
              onCustomWidthChange={setCustomWidth}
              customHeight={customHeight}
              onCustomHeightChange={setCustomHeight}
              unit={unit}
              onUnitChange={setUnit}
              paperSizeKey={paperSizeKey}
              onPaperSizeChange={handlePaperSizeChange}
              // Margin props removed
            />
          </div>

          <div className="preview-area">
            <ImagePreview
              imageSrc={imagePreviewUrl}
              crop={completedCrop}
              settings={currentSettings}
            />
            {/* <pre> block removed */}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;