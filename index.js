#!/usr/bin/env node

// Note: This file uses ES modules

import { program } from 'commander';
import Papa from 'papaparse';
import fs from 'fs/promises';
import chalk from 'chalk';
const inquirer = (await import('inquirer')).default;
import { hexToRgb, loadProjectData, renderGanttChart } from './lib/gantt.js';




const menuStructure = {
  project: {
    name: 'Project Management',
    submenus: {
        gantt: {
        name: 'Gantt Chart Tools',
        actions: ['View Gantt Chart from CSV', 'Export Template CSV']
        }
    }
    },
  development: {
    name: 'Development Tools',
    submenus: {
      git: {
        name: 'Git Operations',
        actions: ['Status', 'Pull', 'Push', 'Create Branch']
      },
      docker: {
        name: 'Docker Commands',
        actions: ['List Containers', 'Start Container', 'Stop Container', 'Remove Container']
      },
      database: {
        name: 'Database Operations',
        actions: ['Backup', 'Restore', 'Migrate', 'Reset']
      }
    }
  },
  system: {
    name: 'System Operations',
    submenus: {
      network: {
        name: 'Network Tools',
        actions: ['Check Connection', 'List Ports', 'DNS Lookup', 'IP Config']
      },
      process: {
        name: 'Process Management',
        actions: ['List Processes', 'Kill Process', 'Monitor Resources', 'Start Service']
      }
    }
  }
};

async function handleAction(mainMenu, submenu, action) {
  console.log(`Executing: ${mainMenu} > ${submenu} > ${action}`);

  if (mainMenu === 'Project Management' && submenu === 'Gantt Chart Tools') {
    if (action === 'View Gantt Chart from CSV') {
      const fileChoice = await inquirer.prompt([
        {
          type: 'input',
          name: 'filepath',
          message: 'Enter the path to your project CSV file:',
          default: 'project.csv'
        }
      ]);

      try {
        const tasks = await loadProjectData(fileChoice.filepath);
        console.log('\nGenerating Gantt Chart...\n');
        renderGanttChart(tasks);
      } catch (error) {
        console.error('Error:', error.message);
      }
    } else if (action === 'Export Template CSV') {
      const template = [
        {
          task: 'Task 1',
          start_date: '2024-02-01',
          end_date: '2024-02-15',
          status: 'In Progress',
          color: '#FF5733',
          assignee: 'Jessica Rabbit'
        },
        {
          task: 'Task 2',
          start_date: '2024-02-10',
          end_date: '2024-02-28',
          status: 'Not Started',
          color: '#33FF57',
          assignee: 'Roger Rabbit'
        }
      ];

      const csv = Papa.unparse(template);
      await fs.writeFile('project_template.csv', csv);
      console.log('Template CSV has been exported to project_template.csv');
    }
  } else {
    // Handle other menu actions
    console.log('This action is not yet implemented.');
  }
}

async function promptUser() {
  try {
    // First level menu selection
    const mainMenuChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainMenu',
        message: 'Select a category:',
        choices: Object.keys(menuStructure).map(key => ({
          name: menuStructure[key].name,
          value: key
        }))
      }
    ]);

    const selectedMainMenu = mainMenuChoice.mainMenu;
    const submenus = menuStructure[selectedMainMenu].submenus;

    // Second level menu selection
    const submenuChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'submenu',
        message: 'Select an operation:',
        choices: Object.keys(submenus).map(key => ({
          name: submenus[key].name,
          value: key
        }))
      }
    ]);

    const selectedSubmenu = submenuChoice.submenu;
    const actions = submenus[selectedSubmenu].actions;

    // Final action selection
    const actionChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: actions
      }
    ]);

    // Handle the selected action
    await handleAction(
      menuStructure[selectedMainMenu].name,
      submenus[selectedSubmenu].name,
      actionChoice.action
    );

    // Ask if user wants to continue
    const continueChoice = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Would you like to perform another operation?',
        default: true
      }
    ]);

    if (continueChoice.continue) {
      await promptUser();
    } else {
      console.log('Goodbye!');
      process.exit(0);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Set up the program
program
  .version('1.0.0')
  .description('Interactive CLI Menu System')
  .action(promptUser);

program.parse(process.argv);