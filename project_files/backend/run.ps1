# PowerShell script to run the Flask backend
# This ensures we use the virtual environment's Python
Set-Location $PSScriptRoot
Write-Host "Starting Flask backend..." -ForegroundColor Green
Write-Host "Using Python: $PSScriptRoot\venv\Scripts\python.exe" -ForegroundColor Cyan
& "$PSScriptRoot\venv\Scripts\python.exe" app.py

