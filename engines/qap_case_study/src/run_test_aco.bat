@echo off
if not exist "bin" mkdir bin
echo [BUILD] Compilando Test ACO...
g++ -O3 -o bin/test_aco.exe main_test_ACO.cpp
if %errorlevel% neq 0 (
    echo [ERROR] Fallo en compilacion.
    exit /b %errorlevel%
)
echo [RUN] Ejecutando Test ACO...
bin\test_aco.exe
