@echo off
echo ===================================================
echo   Starting NewsShield_AI Full-Stack Application
echo ===================================================
echo.

echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "NewsShield Backend (FastAPI)" cmd /k "backend\venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Launching React Frontend on http://localhost:5173 ...
start "NewsShield Frontend (Vite)" cmd /k "npm run dev"

echo.
echo Both services are launching in separate windows!
echo - Frontend UI: http://localhost:5173
echo - Backend API: http://localhost:8000/docs
echo ===================================================
pause
