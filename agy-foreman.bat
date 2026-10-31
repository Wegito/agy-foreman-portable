@echo off
rem agy-foreman, portable (Windows). Run "agy-foreman.bat setup" the first time, or double-click setup.bat.
set "AGY_CALLER_CWD=%CD%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap.ps1" %*
exit /b %errorlevel%
