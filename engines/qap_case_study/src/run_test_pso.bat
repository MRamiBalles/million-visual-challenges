@echo off
if not exist "bin" mkdir bin
echo [BUILD] Compilando Test PSO...
g++ -O3 -o bin/test_pso.exe main_test_PSO.cpp
if %errorlevel% neq 0 (
    echo [ERROR] Fallo en compilacion.
    exit /b %errorlevel%
)
echo [RUN] Ejecutando Test PSO...
bin\test_pso.exe
