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
  // Ensure dates are properly parsed
  const dates = tasks.map(task => ({
    start: new Date(task.start_date),
    end: new Date(task.end_date)
  }));

  let minDate = new Date(Math.min(...dates.map(d => d.start)));
  let maxDate = new Date(Math.max(...dates.map(d => d.end)));

  // Calculate total days for chart width
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  const chartWidth = 50; // Adjustable chart width
  const daysPerChar = Math.ceil(totalDays / chartWidth);

  // Debug information
  console.log('Date range:', {
    min: minDate.toISOString().split('T')[0],
    max: maxDate.toISOString().split('T')[0],
    totalDays,
    daysPerChar
  });

  // Headers with month and date markers
  let monthHeader = chalk.bold('Task'.padEnd(20)) + chalk.bold('|');
  let dayHeader = ' '.repeat(20) + chalk.bold('|');
  let timeline = ' '.repeat(20) + chalk.bold('|');

  let currentMonth = '';
  let monthPos = 0;

  // Calculate the first day of each week
  const weekDays = [];
  let currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    weekDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Render headers
  for (let i = 0; i < chartWidth; i++) {
    const date = new Date(minDate.getTime() + (i * daysPerChar * 24 * 60 * 60 * 1000));
    const month = date.toLocaleString('default', { month: 'short' });

    // Handle month markers
    if (month !== currentMonth) {
      monthHeader += chalk.blue(month.charAt(0));
      currentMonth = month;
    } else {
      monthHeader += ' ';
    }

    // Add single digit for dates
    if (i % 7 === 0) {
      const dayNum = date.getDate();
      dayHeader += chalk.gray(Math.floor(dayNum / 10));  // First digit of date
    } else if (i % 7 === 1) {
      const dayNum = date.getDate();
      dayHeader += chalk.gray(dayNum % 10);  // Second digit of date
    } else {
      dayHeader += ' ';
    }

    timeline += chalk.gray('-');
  }

  console.log(monthHeader);
  console.log(dayHeader);
  console.log(timeline);

  // Function to get initials from full name
  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('');
  }

  // Render each task
  tasks.forEach(task => {
    let taskName = task.task.substring(0, 19).padEnd(20);
    let line = chalk.white(taskName) + chalk.bold('|');
    const startPos = Math.floor((new Date(task.start_date) - minDate) / (1000 * 60 * 60 * 24 * daysPerChar));
    const duration = Math.ceil((new Date(task.end_date) - new Date(task.start_date)) / (1000 * 60 * 60 * 24 * daysPerChar));

    line += ' '.repeat(startPos);

    // Use custom color if provided, otherwise use default
    let barColor = chalk.blue;
    if (task.color && task.color.startsWith('#')) {
      try {
        const rgb = hexToRgb(task.color);
        if (rgb) {
          barColor = chalk.rgb(rgb.r, rgb.g, rgb.b);
        }
      } catch (e) {
        // Fallback to default color if hex parsing fails
        barColor = chalk.blue;
      }
    }

    // Calculate positions for the bar and initials
    const initials = task.assignee ? getInitials(task.assignee) : '';
    const barLength = Math.max(1, duration);

    if (barLength > 2 && initials) {  // Only show initials if bar is long enough
      const beforeInitials = Math.floor((barLength - initials.length) / 2);
      const afterInitials = barLength - beforeInitials - initials.length;

      line += barColor('='.repeat(beforeInitials));
      line += barColor(initials);
      line += barColor('='.repeat(afterInitials));
    } else {
      line += barColor('='.repeat(barLength));
    }

    line += ' '.repeat(Math.max(0, chartWidth - startPos - duration));

    console.log(line);
  });
}

