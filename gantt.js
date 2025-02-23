// gantt.js
import chalk from 'chalk';
import Papa from 'papaparse';
import fs from 'fs/promises';

// Utility function for converting hex colors to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Utility function for getting initials
export function getInitials(name) {
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('');
}

// Function to load and parse CSV data
export async function loadProjectData(filepath) {
  try {
    console.log('Reading file:', filepath); // Debug log
    const fileContent = await fs.readFile(filepath, 'utf8');
    console.log('File content received'); // Debug log

    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          console.log('Papa parse complete'); // Debug log
          resolve(results.data);
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error in loadProjectData:', error); // Debug log
    throw new Error(`Error reading CSV file: ${error.message}`);
  }
}

// Function to render the Gantt chart
export function renderGanttChart(tasks) {
  // ... rest of the renderGanttChart implementation ...
}