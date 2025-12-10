@echo off
cd /d "%~dp0"
echo Starting Flask backend...
echo Using virtual environment Python...
venv\Scripts\python.exe app.py
pause

