const { execSync } = require('child_process');
const path = require('path');

try {
    console.log('Testing build script...');
    const result = execSync('node build.js', { 
        cwd: 'C:\\DEV\\Project IO MVP',
        encoding: 'utf8' 
    });
    console.log(result);
} catch (error) {
    console.error('Error:', error.message);
    console.log('Output:', error.stdout);
}