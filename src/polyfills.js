if (typeof global.defaultSystemFonts === 'undefined') {
  // A minimal polyfill for the missing property.
  // We provide a basic set of system fonts. This might not be perfect for all cases,
  // but it should resolve the reference error.
  global.defaultSystemFonts = [
    'System',
    'sans-serif',
    'Roboto',
    'Helvetica',
    'Arial',
  ];
} 