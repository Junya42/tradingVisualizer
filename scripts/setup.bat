@echo off

echo Setting up Trading Backtest Desktop Application...

REM Install root dependencies
echo Installing root dependencies...
npm install

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Install Python dependencies
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo Setup complete! Run 'npm run dev' to start development mode.
pause 