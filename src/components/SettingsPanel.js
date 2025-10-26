import React from 'react';
import { printSizes, paperSizes } from '../utils/presets';
import './SettingsPanel.css';

function SettingsPanel({
  printSizeKey,
  onPrintSizeChange,
  customWidth,
  onCustomWidthChange,
  customHeight,
  onCustomHeightChange,
  unit,
  onUnitChange,
  paperSizeKey,
  onPaperSizeChange,
  // margin, // Removed margin prop
  // onMarginChange, // Removed margin handler prop
}) {
  const isCustom = printSizeKey === 'custom';

  const handlePresetChange = (event) => {
    const newKey = event.target.value;
    onPrintSizeChange(newKey);
    // If switching to a preset, update custom fields too (optional, but can be helpful)
    if (newKey !== 'custom') {
      const preset = printSizes[newKey];
      onCustomWidthChange(preset.width);
      onCustomHeightChange(preset.height);
      onUnitChange(preset.unit);
    }
  };

  const handleUnitChange = (event) => {
    onUnitChange(event.target.value);
  };


  return (
    <div className="settings-panel">
      <h2>1. Select Print Size</h2>
      <div className="form-group">
        <label htmlFor="print-size">Preset Size</label>
        <select id="print-size" value={printSizeKey} onChange={handlePresetChange}>
          {Object.keys(printSizes).map((key) => (
            <option key={key} value={key}>
              {printSizes[key].name}
            </option>
          ))}
        </select>
      </div>

      {isCustom && (
        <div className="custom-size-group animate-fade-in">
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="custom-width">Width</label>
              <input
                type="number"
                id="custom-width"
                value={customWidth}
                onChange={(e) => onCustomWidthChange(parseFloat(e.target.value))}
                min="0.1"
                step="0.1"
                className="input-number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="custom-height">Height</label>
              <input
                type="number"
                id="custom-height"
                value={customHeight}
                onChange={(e) => onCustomHeightChange(parseFloat(e.target.value))}
                min="0.1"
                step="0.1"
                className="input-number"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Unit</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="cm"
                  checked={unit === 'cm'}
                  onChange={handleUnitChange}
                /> cm
              </label>
              <label>
                <input
                  type="radio"
                  value="in"
                  checked={unit === 'in'}
                  onChange={handleUnitChange}
                /> in
              </label>
            </div>
          </div>
        </div>
      )}

      <h2>2. Select Paper Layout</h2>
      <div className="form-group">
        <label htmlFor="paper-size">Paper Size</label>
        <select id="paper-size" value={paperSizeKey} onChange={(e) => onPaperSizeChange(e.target.value)}>
          {Object.keys(paperSizes).map((key) => (
            <option key={key} value={key}>
              {paperSizes[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* Margin input removed */}
      {/*
      <div className="form-group">
        <label htmlFor="margin">Margin Between Photos (mm)</label>
        <input
          type="number"
          id="margin"
          value={margin}
          onChange={(e) => onMarginChange(parseInt(e.target.value, 10))}
          min="0"
          step="1"
          className="input-number"
        />
      </div>
      */}
    </div>
  );
}

export default SettingsPanel;