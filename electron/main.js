const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'frontend', 'out', 'index.html');
    console.log('Loading file from:', indexPath);
    mainWindow.loadURL(`file://${indexPath}`);
    
    // Only open dev tools in production if there are issues
    // mainWindow.webContents.openDevTools();
  }

  // Add error handling for failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorDescription);
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const backendPath = isDev 
    ? path.join(__dirname, '..', 'backend', 'server.py')
    : path.join(process.resourcesPath, 'backend', 'server.py');
  
  let pythonPath = isDev 
    ? path.join(__dirname, '..', 'backend', 'venv', 'bin', 'python')
    : path.join(process.resourcesPath, 'backend', 'venv', 'bin', 'python');
  
  // For Windows in production
  if (!isDev && process.platform === 'win32') {
    pythonPath = path.join(process.resourcesPath, 'backend', 'venv', 'Scripts', 'python.exe');
  }
  
  console.log('Starting backend with:', pythonPath, backendPath);
  
  // Set working directory to backend folder
  const workingDir = isDev 
    ? path.join(__dirname, '..', 'backend')
    : path.join(process.resourcesPath, 'backend');
  
  backendProcess = spawn(pythonPath, [backendPath], {
    stdio: 'pipe',
    cwd: workingDir,
    env: { 
      ...process.env, 
      PYTHONPATH: workingDir,
      PYTHONUNBUFFERED: '1'
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log('Backend stdout:', data.toString());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error('Backend stderr:', data.toString());
  });

  backendProcess.on('close', (code) => {
    console.log('Backend process exited with code:', code);
    if (code !== 0 && code !== null) {
      console.error('Backend exited with non-zero code, attempting restart...');
      setTimeout(() => {
        if (!backendProcess || backendProcess.killed) {
          startBackend();
        }
      }, 3000);
    }
  });

  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
    // Try to restart backend after a delay
    setTimeout(() => {
      console.log('Attempting to restart backend after error...');
      if (!backendProcess || backendProcess.killed) {
        startBackend();
      }
    }, 3000);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  startBackend();
  
  // Wait a bit for backend to start
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Handle app quit
app.on('quit', () => {
  stopBackend();
});

// IPC handlers for communication between renderer and main process
ipcMain.handle('get-backend-url', () => {
  return 'http://localhost:8000';
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
}); 