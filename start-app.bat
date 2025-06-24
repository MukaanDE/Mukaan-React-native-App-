@echo off
echo.
echo ========================================
echo    MUKAAN APP - START SCRIPT
echo ========================================
echo.
echo Starte die Mukaan App...
echo.

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo FEHLER: Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

REM Prüfe ob npm installiert ist
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo FEHLER: npm ist nicht installiert!
    pause
    exit /b 1
)

REM Installiere Dependencies falls node_modules nicht existiert
if not exist "node_modules" (
    echo Installiere Dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo FEHLER: Installation fehlgeschlagen!
        pause
        exit /b 1
    )
)

echo.
echo Starte Expo Development Server...
echo.
echo Drücke 'a' für Android
echo Drücke 'i' für iOS (nur auf macOS)
echo Drücke 'w' für Web
echo Drücke 'r' zum Neuladen
echo Drücke 'm' für Menü
echo Drücke 'q' zum Beenden
echo.

REM Starte die App
npm start

pause 