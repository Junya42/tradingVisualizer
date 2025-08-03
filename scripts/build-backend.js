const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const backendDir = path.join(__dirname, '..', 'backend');
const venvDir = path.join(backendDir, 'venv');

// Change to backend directory
process.chdir(backendDir);

console.log('Creating virtual environment...');
execSync('python -m venv venv', { stdio: 'inherit' });

// Determine the correct pip path
let pipPath;
if (isWindows) {
  pipPath = path.join(venvDir, 'Scripts', 'pip.exe');
} else {
  pipPath = path.join(venvDir, 'bin', 'pip');
}

console.log('Upgrading pip, setuptools, and wheel...');
execSync(`"${pipPath}" install --upgrade pip setuptools wheel`, { stdio: 'inherit' });

console.log('Installing requirements...');
execSync(`"${pipPath}" install -r requirements.txt`, { stdio: 'inherit' });

console.log('Backend build completed successfully!'); 