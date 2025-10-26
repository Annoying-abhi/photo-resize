// Define standard print sizes in cm
export const printSizes = {
  indianPassport: {
    width: 3.5,
    height: 4.5,
    unit: 'cm',
    name: 'Indian Passport (3.5 x 4.5 cm)',
  },
  stamp: {
    width: 2.0,
    height: 2.5,
    unit: 'cm',
    name: 'Stamp Size (2.0 x 2.5 cm)',
  },
  pkPassport: {
    width: 3.5,
    height: 4.5,
    unit: 'cm',
    name: 'Pakistan Passport (3.5 x 4.5 cm)',
  },
  usPassport: {
    width: 5.1, // 2 inches
    height: 5.1, // 2 inches
    unit: 'cm',
    name: 'US Passport (2 x 2 in / 5.1 x 5.1 cm)',
  },
  schengenVisa: {
    width: 3.5,
    height: 4.5,
    unit: 'cm',
    name: 'Schengen Visa (3.5 x 4.5 cm)',
  },
  // Add more presets here as needed
  custom: {
    width: 3.5, // Default custom size
    height: 4.5,
    unit: 'cm',
    name: 'Custom Size...',
  },
};

// Define standard paper sizes in mm (for easier calculations later)
export const paperSizes = {
  A4: { width: 210, height: 297, name: 'A4 (210 x 297 mm)' },
  '4x6': { width: 101.6, height: 152.4, name: '4x6 inch (102 x 152 mm)' }, // Approx 102x152 mm
  Letter: { width: 215.9, height: 279.4, name: 'US Letter (8.5 x 11 in)' }, // Approx 216x279 mm
};