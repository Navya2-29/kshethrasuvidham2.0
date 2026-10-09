@echo off
title Anna Nagar Temple Billing - Silent Print Launcher
echo Starting Anna Nagar Temple Billing in Silent Printing Mode...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --disable-print-preview --user-data-dir="%LOCALAPPDATA%\ChromePOS" http://localhost:4200/
