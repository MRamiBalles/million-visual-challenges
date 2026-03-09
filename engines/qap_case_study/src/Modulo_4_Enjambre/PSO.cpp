#include <vector>
#include <cmath>
#include <iostream>
#include <algorithm>
#include <limits>
#include <fstream>
#include "EvaluadorContinuo.cpp"
// Asumimos Core/Generador.cpp incluido externamente para aleatorioUniforme()

using namespace std;

// Generate double in range [min, max] - Wrapper if not in Generador.cpp
double aleatorioReal(double min, double max) {
    // Reutiliza aleatorioUniforme() [0,1] del Core o implementa
    return min + (max - min) * aleatorioUniforme();
}

struct Particula {
    vector<double> posicion;
    vector<double> velocidad;
    
    // Mejor Personal (pBest)
    vector<double> pBestPos;
    double pBestFit;
    
    double fitnessActual;
};

struct ConfigPSO {
    int numParticulas = 30;
    int dimensiones = 10; // D=10 o D=30
    int maxIteraciones = 100;
    
    // Parámetros
    double W = 0.7;
    double C1 = 1.5;
    double C2 = 1.5;
    
    // Límites
    double minX = -5.12;
    double maxX = 5.12;
    double minV = -5.12; // Velocidad máxima (suele ser el rango)
    double maxV = 5.12;
};

struct ResultadoPSO {
    vector<double> mejorSolucion;
    double mejorCoste;
};

// Topología de Anillo (Vecindad local)
// Retorna el índice de la mejor partícula en el vecindario de 'idx'
// Vecinos: idx-2, idx-1, idx, idx+1, idx+2 (Circular)
int obtenerLBestIndex(int idx, const vector<Particula>& enjambre) {
    int n = enjambre.size();
    int mejorVecino = idx; // Incluye a sí misma? Guía dice "cada partícula tiene 4 vecinos". 
                           // Usualmente se compara con vecinos para hallar lBest.
                           // Asumiremos que lBest es el mejor de {i-2, i-1, i+1, i+2} (y tal vez i?).
                           // Standard PSO local: lBest es el mejor del vecindario.
    
    // Indices relativos: -2, -1, 1, 2
    vector<int> offsets = {-2, -1, 1, 2};
    
    for (int off : offsets) {
        int vecinoIdx = (idx + off) % n;
        if (vecinoIdx < 0) vecinoIdx += n; // Corrección módulo negativo
        
        if (enjambre[vecinoIdx].pBestFit < enjambre[mejorVecino].pBestFit) {
            mejorVecino = vecinoIdx;
        }
    }
    
    // También comparamos con el propio pBest? 
    // La fórmula usa (lBest - x). Si lBest soy yo, el término social es 0. 
    // Normalmente lBest se elige entre (Vecinos U {Yo}).
    // Ya inicialicé mejorVecino = idx, así que está cubierto.
    
    return mejorVecino;
}

ResultadoPSO ejecutarPSO(ConfigPSO config, string logFile = "") {
    ofstream log;
    if (logFile != "") {
        log.open(logFile);
        log << "Iter,MejorGlobalFit\n";
    }

    // 1. Inicialización
    vector<Particula> enjambre(config.numParticulas);
    vector<double> mejorGlobalPos;
    double mejorGlobalFit = numeric_limits<double>::max();
    
    for(int i=0; i<config.numParticulas; i++) {
        enjambre[i].posicion.resize(config.dimensiones);
        enjambre[i].velocidad.resize(config.dimensiones);
        
        for(int d=0; d<config.dimensiones; d++) {
            enjambre[i].posicion[d] = aleatorioReal(config.minX, config.maxX);
            enjambre[i].velocidad[d] = aleatorioReal(config.minV, config.maxV) * 0.1; // V inicial pequeña
        }
        
        enjambre[i].fitnessActual = evaluadorRastrigin(enjambre[i].posicion);
        
        // pBest inicial
        enjambre[i].pBestPos = enjambre[i].posicion;
        enjambre[i].pBestFit = enjambre[i].fitnessActual;
        
        // gBest (solo para reporte, no para actualización en anillo estrictamente)
        if (enjambre[i].pBestFit < mejorGlobalFit) {
            mejorGlobalFit = enjambre[i].pBestFit;
            mejorGlobalPos = enjambre[i].pBestPos;
        }
    }
    
    // Bucle Principal
    for(int iter=0; iter<config.maxIteraciones; iter++) {
        
        for(int i=0; i<config.numParticulas; i++) {
            // 2. Determinar lBest (Local Best)
            int lBestIdx = obtenerLBestIndex(i, enjambre);
            const vector<double>& lBestPos = enjambre[lBestIdx].pBestPos;
            
            // 3. Actualizar Velocidad y Posición
            for(int d=0; d<config.dimensiones; d++) {
                double r1 = aleatorioUniforme();
                double r2 = aleatorioUniforme();
                
                // V(t+1) = W*V(t) + c1*r1*(pBest - x) + c2*r2*(lBest - x)
                enjambre[i].velocidad[d] = config.W * enjambre[i].velocidad[d] 
                                         + config.C1 * r1 * (enjambre[i].pBestPos[d] - enjambre[i].posicion[d])
                                         + config.C2 * r2 * (lBestPos[d] - enjambre[i].posicion[d]);
                                         
                // Control de Velocidad (Opcional, pero recomendado)
                // if (enjambre[i].velocidad[d] > config.maxV) enjambre[i].velocidad[d] = config.maxV;
                // if (enjambre[i].velocidad[d] < config.minV) enjambre[i].velocidad[d] = config.minV;
                
                // X(t+1) = X(t) + V(t+1)
                enjambre[i].posicion[d] += enjambre[i].velocidad[d];
                
                // 4. Control de Fronteras (Pared Absorbente)
                if (enjambre[i].posicion[d] > config.maxX) {
                    enjambre[i].posicion[d] = config.maxX;
                    enjambre[i].velocidad[d] = 0; // Choca y para
                } else if (enjambre[i].posicion[d] < config.minX) {
                    enjambre[i].posicion[d] = config.minX;
                    enjambre[i].velocidad[d] = 0;
                }
            }
            
            // 5. Evaluación y Actualización
            double nuevoFit = evaluadorRastrigin(enjambre[i].posicion);
            enjambre[i].fitnessActual = nuevoFit;
            
            // Actualizar pBest
            if (nuevoFit < enjambre[i].pBestFit) {
                enjambre[i].pBestFit = nuevoFit;
                enjambre[i].pBestPos = enjambre[i].posicion;
                
                // Actualizar gBest (Global)
                if (nuevoFit < mejorGlobalFit) {
                    mejorGlobalFit = nuevoFit;
                    mejorGlobalPos = enjambre[i].posicion;
                }
            }
        }
        
        if (logFile != "") {
            log << iter << "," << mejorGlobalFit << "\n";
        }
    }
    
    if (logFile != "") log.close();
    return {mejorGlobalPos, mejorGlobalFit};
}
