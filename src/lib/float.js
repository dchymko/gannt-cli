import fetch from 'node-fetch';

const apiKey = process.env['API_KEY'];

export async function getPeople () {
    const response = await fetch('https://api.float.com/v3/people', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return await response.json();
}

export async function getProjectTasks () {
    const response = await fetch('https://api.float.com/v3/project-tasks', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return await response.json();
}

export async function getAllocations () {
    const sort = 'start_date'
    const response = await fetch(`https://api.float.com/v3/tasks?sort=${sort}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return await response.json();
}