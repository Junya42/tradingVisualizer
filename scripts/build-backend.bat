@echo off
cd /d "%~dp0..\backend"

echo Creating virtual environment...
python -m venv venv

echo Upgrading pip, setuptools, and wheel...
venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel

echo Installing requirements...
venv\Scripts\python.exe -m pip install -r requirements.txt

echo Backend build completed successfully! 