$ErrorActionPreference = "Stop"

$venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
if (!(Test-Path $venvPython)) {
  Write-Host "Virtual environment not found. Creating venv..."
  python -m venv (Join-Path $PSScriptRoot "venv")
}

$venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
Write-Host "Using Python:" $venvPython

Write-Host "Installing/refreshing backend dependencies..."
& $venvPython -m pip install -r (Join-Path $PSScriptRoot "requirements.txt")

Write-Host "Starting backend server on http://127.0.0.1:8000"
& $venvPython -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
