# Trading Backtest Desktop Application

A desktop application for running trading strategy backtests, built with Electron, React, and FastAPI.

## Features

- **Strategy Management**: Upload and manage Python trading strategies
- **Multi-file Support**: Upload multiple CSV files for backtesting
- **Drag & Drop**: Easy file upload with drag and drop support
- **Auto-naming**: Automatic backtest naming with versioning
- **Performance Metrics**: Comprehensive backtest results and analytics
- **Desktop App**: Standalone desktop application

## Prerequisites

- Node.js 18+ 
- Python 3.8+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-backtest-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (Electron)
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install Python dependencies
   cd ../backend && pip install -r requirements.txt
   ```

## Development

### Running in Development Mode

```bash
# From the root directory
npm run dev
```

This will start:
- Frontend (Next.js) on http://localhost:3000
- Backend (FastAPI) on http://localhost:8000
- Electron app that loads the frontend

### Running Individual Components

```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend

# Electron only (requires frontend to be running)
npm run dev:electron
```

## Building for Production

### Build All Components

```bash
# Build frontend and backend
npm run build

# Package as desktop application
npm run package
```

### Build Individual Components

```bash
# Build frontend only
npm run build:frontend

# Install backend dependencies
npm run build:backend
```

## Distribution

### Create Distributables

```bash
# Create distributable packages
npm run dist
```

This will create platform-specific packages:
- **Windows**: NSIS installer
- **macOS**: DMG file
- **Linux**: AppImage

### Automated Builds with GitHub Actions

This project includes GitHub Actions workflows for automated builds:

#### Automatic Builds
- **Trigger**: Push to `main` or `master` branch
- **Action**: Builds for all platforms (Windows, macOS, Linux)
- **Output**: Artifacts available in GitHub Actions

#### Manual Releases
- **Trigger**: Manual workflow dispatch
- **Action**: Builds all platforms and creates GitHub release
- **Output**: Tagged release with downloadable installers

#### How to Create a Release

1. **Go to GitHub Actions** in your repository
2. **Select "Release Electron App"** workflow
3. **Click "Run workflow"**
4. **Enter version** (e.g., `v1.0.0`)
5. **Choose prerelease** if needed
6. **Click "Run workflow"**

The workflow will:
- Build for Windows, macOS, and Linux
- Create a GitHub release with all installers
- Tag the release with your version

#### Release Artifacts
Each release includes:
- **Windows**: `Trading Backtest Setup v1.0.0.exe`
- **macOS**: `Trading Backtest v1.0.0.dmg`
- **Linux**: `Trading Backtest v1.0.0.AppImage`  
- **Linux**: AppImage

### Output Location

Distributables will be created in the `dist/` directory.

## Project Structure

```
├── electron/                 # Electron main process
│   ├── main.js             # Main process entry point
│   ├── preload.js          # Preload script for security
│   └── assets/             # App icons and assets
├── frontend/               # React/Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── lib/              # Utility functions
├── backend/               # FastAPI backend
│   ├── server.py         # Main server file
│   ├── strategies/       # Trading strategies
│   └── requirements.txt  # Python dependencies
├── package.json          # Root package.json
└── README.md            # This file
```

## Development Notes

### Backend Integration

The Electron app automatically starts the Python backend server and manages its lifecycle. The backend runs on localhost:8000 and is accessible to the frontend.

### Frontend Configuration

The frontend is configured for static export to work with Electron. The `next.config.js` file handles this configuration.

### Security

- Context isolation is enabled in Electron
- Node integration is disabled for security
- IPC communication is handled through the preload script

## Troubleshooting

### Common Issues

1. **Python not found**: Ensure Python is in your PATH
2. **Port conflicts**: Make sure ports 3000 and 8000 are available
3. **Build errors**: Check that all dependencies are installed

### Debug Mode

To run with debug information:

```bash
# Set debug environment
export DEBUG=electron-builder
npm run dev
```

## License

MIT License - see LICENSE file for details. 