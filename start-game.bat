@echo off
title Symbiote: Apex Predator (Venom Protocol)
cd /d "%~dp0"

echo ===================================================
echo   🕷️ SYMBIOTE: APEX PREDATOR (VENOM)
echo   Living Slime • Prop Mimic • AK-47 Bodyguards
echo ===================================================
echo Starting game server...
start "" http://localhost:8110
node server.js
pause
