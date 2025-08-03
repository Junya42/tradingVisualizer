const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
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
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'out', 'index.html'));
  }

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
  
  const pythonPath = isDev ? 'python' : path.join(process.resourcesPath, 'python', 'python.exe');
  
  backendProcess = spawn(pythonPath, [backendPath], {
    stdio: 'pipe',
    env: { ...process.env, PYTHONPATH: path.dirname(backendPath) }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log('Backend stdout:', data.toString());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error('Backend stderr:', data.toString());
  });

  backendProcess.on('close', (code) => {
    console.log('Backend process exited with code:', code);
  });

  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
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
  return isDev ? 'http://localhost:8000' : 'http://localhost:8000';
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
}); 