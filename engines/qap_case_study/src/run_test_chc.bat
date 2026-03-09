@echo off
if not exist "bin" mkdir bin
echo [BUILD] Compilando Test CHC...
g++ -O3 -o bin/test_chc.exe main_test_CHC.cpp
if %errorlevel% neq 0 (
    echo [ERROR] Fallo en compilacion.
    exit /b %errorlevel%
)
echo [RUN] Ejecutando Test CHC...
bin\test_chc.exe
