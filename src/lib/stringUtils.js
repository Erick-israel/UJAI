
import React from 'react';

export const sanitizeFileName = (fileName) => {
  if (!fileName) return '';
  // Remove or replace special characters except for '.', '_', '-'
  // Also, replace multiple spaces with a single space
  let sanitized = fileName.replace(/[^\w\s.-]/gi, '_'); // Replace non-alphanumeric (excluding ., -, whitespace) with _
  sanitized = sanitized.replace(/\s+/g, ' '); // Collapse multiple spaces to one
  return sanitized.trim(); // Trim leading/trailing spaces
};
