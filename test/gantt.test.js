// gantt.test.js

import { jest } from '@jest/globals';
import * as ganttModule from '../lib/gantt.js';
import fs from 'fs/promises';
import Papa from 'papaparse';

// Mock external dependencies
jest.mock('chalk', () => ({
  default: {
    bold: jest.fn(str => str),
    blue: jest.fn(str => str),
    gray: jest.fn(str => str),
    white: jest.fn(str => str),
    rgb: jest.fn(() => (str => str))
  }
}));

// Create mock functions
const mockReadFile = jest.fn();
const mockPapaParse = jest.fn();

jest.mock('fs/promises', () => ({
  default: {
    readFile: mockReadFile
  }
}));

jest.mock('papaparse', () => ({
  default: {
    parse: mockPapaParse
  }
}));

describe('Utility Functions', () => {
  describe('hexToRgb', () => {
    test('converts valid hex color to RGB', () => {
      expect(ganttModule.hexToRgb('#FF5733')).toEqual({
        r: 255,
        g: 87,
        b: 51
      });
    });

    test('handles invalid hex color', () => {
      expect(ganttModule.hexToRgb('invalid')).toBeNull();
    });

    test('handles hex without #', () => {
      expect(ganttModule.hexToRgb('FF5733')).toEqual({
        r: 255,
        g: 87,
        b: 51
      });
    });
  });

  describe('getInitials', () => {
    test('gets initials from full name', () => {
      expect(ganttModule.getInitials('Jessica Rabbit')).toBe('JR');
    });

    test('handles single name', () => {
      expect(ganttModule.getInitials('Madonna')).toBe('M');
    });

    test('handles multiple spaces', () => {
      expect(ganttModule.getInitials('Jean   Claude Van  Damme')).toBe('JCVD');
    });
  });
});

describe('Data Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadProjectData', () => {
    const mockCsvContent = `task,start_date,end_date,status,color,assignee
Design Phase,2024-02-01,2024-02-15,In Progress,#FF5733,Jessica Rabbit`;

    test.skip('loads and parses CSV data correctly', async () => {
      mockReadFile.mockResolvedValue(mockCsvContent);
      mockPapaParse.mockImplementation((content, options) => {
        options.complete({
          data: [{
            task: 'Design Phase',
            start_date: '2024-02-01',
            end_date: '2024-02-15',
            status: 'In Progress',
            color: '#FF5733',
            assignee: 'Jessica Rabbit'
          }]
        });
      });

      const data = await ganttModule.loadProjectData('test.csv');
      expect(data).toHaveLength(1);
      expect(data[0].task).toBe('Design Phase');
      expect(mockReadFile).toHaveBeenCalledWith('test.csv', 'utf8');
      expect(mockPapaParse).toHaveBeenCalled();
    });

    test('handles file read errors', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));
      await expect(ganttModule.loadProjectData('nonexistent.csv')).rejects.toThrow('Error reading CSV file');
    });
  });
});

describe('Gantt Chart Rendering', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const sampleTasks = [
    {
      task: 'Design Phase',
      start_date: '2024-02-01',
      end_date: '2024-02-15',
      status: 'In Progress',
      color: '#FF5733',
      assignee: 'Jessica Rabbit'
    }
  ];

  test('renders chart with correct headers', () => {
    ganttModule.renderGanttChart(sampleTasks);
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Task'));
  });

  test('handles tasks with no assignee', () => {
    const tasksNoAssignee = [{
      ...sampleTasks[0],
      assignee: undefined
    }];

    expect(() => ganttModule.renderGanttChart(tasksNoAssignee)).not.toThrow();
  });
});