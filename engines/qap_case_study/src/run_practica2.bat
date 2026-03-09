@echo off
if not exist "bin" mkdir bin
echo [BUILD] Compilando Practica 2...
g++ -O3 -o bin/practica2.exe main_practica2.cpp
if %errorlevel% neq 0 (
    echo [ERROR] Fallo en compilacion.
    exit /b %errorlevel%
)
echo [RUN] Ejecutando Benchmark Multiarranque...
bin\practica2.exe
echo [DONE] Finalizado.
