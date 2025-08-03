const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const backendDir = path.join(__dirname, '..', 'backend');

// Change to backend directory
process.chdir(backendDir);

console.log('Creating virtual environment...');
try {
  // Try python3 first, then python as fallback
  try {
    execSync('python3 -m venv venv', { stdio: 'inherit' });
  } catch (e) {
    execSync('python -m venv venv', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Failed to create virtual environment:', error.message);
  process.exit(1);
}

// Determine the correct python path for the virtual environment
let pythonPath;
if (isWindows) {
  pythonPath = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
} else {
  pythonPath = path.join(backendDir, 'venv', 'bin', 'python');
}

console.log('Upgrading pip, setuptools, and wheel...');
try {
  execSync(`"${pythonPath}" -m pip install --upgrade pip setuptools wheel`, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to upgrade pip:', error.message);
  process.exit(1);
}

console.log('Installing requirements...');
try {
  execSync(`"${pythonPath}" -m pip install -r requirements.txt`, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install requirements:', error.message);
  process.exit(1);
}

console.log('Backend build completed successfully!'); 