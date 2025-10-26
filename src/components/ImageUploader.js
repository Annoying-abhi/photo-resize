import React, { useRef } from 'react';
import './ImageUploader.css'; // We'll create this file next

function ImageUploader({ onImageUpload }) {
  const fileInputRef = useRef(null);

  // Function to handle file selection via click
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
    // Reset file input value so the same file can be uploaded again if needed
    event.target.value = null;
  };

  // Function to trigger file input click
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Drag and Drop Handlers
  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow dropping
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Prevent browser from opening the file
    event.currentTarget.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  return (
    <div
      className="image-uploader-container"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp" // Accept common image types
        style={{ display: 'none' }} // Hide the default input
      />
      <div className="upload-icon">🖼️</div> {/* Simple icon */}
      <p>Drag & Drop your photo here</p>
      <p>or</p>
      <button type="button" className="upload-button">
        Click to Upload
      </button>
      <p className="file-types">Supports: PNG, JPG, WEBP</p>
    </div>
  );
}

export default ImageUploader;