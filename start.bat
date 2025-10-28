@echo off
echo Starting KatReview Website...
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing root dependencies
    pause
    exit /b 1
)

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing server dependencies
    pause
    exit /b 1
)

echo Installing client dependencies...
cd ../client
call npm install
if %errorlevel% neq 0 (
    echo Error installing client dependencies
    pause
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo.
echo Starting development servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

cd ..
call npm run dev

pause
