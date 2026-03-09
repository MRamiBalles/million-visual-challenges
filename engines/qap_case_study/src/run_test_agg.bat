@echo off
if not exist "bin" mkdir bin
echo [BUILD] Compilando Test AGG...
g++ -O3 -o bin/test_agg.exe main_test_AGG.cpp
if %errorlevel% neq 0 (
    echo [ERROR] Fallo en compilacion.
    exit /b %errorlevel%
)
echo [RUN] Ejecutando Test AGG...
bin\test_agg.exe
