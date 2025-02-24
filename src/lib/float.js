import fetch from 'node-fetch';

export async function getProjects () {
    const response = await fetch('https://api.float.com/v3');
    return await response.json();
}