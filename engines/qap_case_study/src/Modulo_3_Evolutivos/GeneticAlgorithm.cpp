#include <vector>
#include <iostream>
#include <algorithm>
#include <fstream>
#include "Crossover.cpp"
// Asumimos Core (Evaluador, Generador) incluido en main o unity build

using namespace std;

struct Individuo {
    vector<int> genotipo;
    long long fitness;
    
    // Operador para ordenar (menor fitness es mejor en minimización)
    bool operator<(const Individuo& otro) const {
        return fitness < otro.fitness;
    }
};

// --- Configuración AGG ---
struct ConfigAGG {
    int poblacionSize = 50; // N=50
    double probCruce = 0.9; // 90%
    double probMutacion = 0.05; // 5% por individuo (o 1/N por gen? Guia dice Intercambio simple)
    int maxGeneraciones = 200; // Criterio parada
};

// Selección por Torneo: k = 10% de N
int seleccionTorneo(const vector<Individuo>& poblacion, int k) {
    int n = poblacion.size();
    int mejorIdx = -1;
    long long mejorFit = -1;
    
    for(int i=0; i<k; i++) {
        int idx = aleatorio(0, n-1);
        if (mejorIdx == -1 || poblacion[idx].fitness < mejorFit) {
            mejorIdx = idx;
            mejorFit = poblacion[idx].fitness;
        }
    }
    return mejorIdx;
}

// Mutación: Swap simple
void mutarSwap(vector<int>& sol) {
    int n = sol.size();
    int i = aleatorio(0, n-1);
    int j = aleatorio(0, n-1);
    while (i == j) j = aleatorio(0, n-1);
    swap(sol[i], sol[j]);
}

struct ResultadoAGG {
    vector<int> mejorSolucion;
    long long mejorCoste;
    // Log vectors could be added here
};

ResultadoAGG geneticoGeneracional(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, ConfigAGG config, string logFile = "") {
    int n = flujo.size();
    ofstream log;
    
    if (logFile != "") {
        log.open(logFile);
        log << "Gen,MejorFit,MediaFit\n";
    }
    
    // 1. Inicialización
    vector<Individuo> poblacion(config.poblacionSize);
    for(int i=0; i<config.poblacionSize; i++) {
        poblacion[i].genotipo = generarSolucionAleatoria(n);
        poblacion[i].fitness = evaluarSolucion(poblacion[i].genotipo, flujo, distancia);
    }
    
    // Ordenar inicial (opcional, ayuda a elitismo)
    sort(poblacion.begin(), poblacion.end()); // Menor a Mayor
    Individuo mejorGlobal = poblacion[0];
    
    // Bucle Evolutivo
    for(int gen = 0; gen < config.maxGeneraciones; gen++) {
        
        // Log Statistics
        long long sumaFit = 0;
        for(const auto& ind : poblacion) sumaFit += ind.fitness;
        double mediaFit = (double)sumaFit / config.poblacionSize;
        
        if (logFile != "") {
            log << gen << "," << poblacion[0].fitness << "," << mediaFit << "\n";
        }
        
        if (poblacion[0].fitness < mejorGlobal.fitness) {
            mejorGlobal = poblacion[0];
        }
        
        // Nueva Población
        vector<Individuo> nuevaPoblacion;
        nuevaPoblacion.reserve(config.poblacionSize);
        
        // 2. Elitismo: Pasar el mejor de la anterior (el 0 tras ordenar)
        // La guía sugiere pasar "el mejor o los mejores". Pasamos 1 seguro.
        // Ojo: Si la población no está ordenada, hay que buscar el mejor. 
        // Como ordenaremos al final del bucle, poblacion[0] es el mejor de la generación actual.
        nuevaPoblacion.push_back(poblacion[0]); 
        
        // 3. Reproducción hasta llenar
        while(nuevaPoblacion.size() < config.poblacionSize) {
            // Selección (Padres)
            // K = 10% Poblacion
            int kTorneo = max(2, (int)(config.poblacionSize * 0.1));
            
            int p1Idx = seleccionTorneo(poblacion, kTorneo);
            int p2Idx = seleccionTorneo(poblacion, kTorneo);
            
            // Cruce (0.9)
            vector<int> h1 = poblacion[p1Idx].genotipo;
            vector<int> h2 = poblacion[p2Idx].genotipo;
            
            if (aleatorioUniforme() < config.probCruce) {
                cruceOX(poblacion[p1Idx].genotipo, poblacion[p2Idx].genotipo, h1, h2);
            }
            
            // Mutación (Swap)
            if (aleatorioUniforme() < config.probMutacion) mutarSwap(h1);
            if (aleatorioUniforme() < config.probMutacion) mutarSwap(h2);
            
            // Evaluar Hijos
            Individuo ind1, ind2;
            ind1.genotipo = h1;
            ind1.fitness = evaluarSolucion(h1, flujo, distancia);
            ind2.genotipo = h2;
            ind2.fitness = evaluarSolucion(h2, flujo, distancia);
            
            // Insertar (si cabe)
            if (nuevaPoblacion.size() < config.poblacionSize) nuevaPoblacion.push_back(ind1);
            if (nuevaPoblacion.size() < config.poblacionSize) nuevaPoblacion.push_back(ind2);
        }
        
        // Reemplazo completo
        poblacion = nuevaPoblacion;
        
        // Ordenar para siguiente generación (Elitismo fácil + Stats)
        sort(poblacion.begin(), poblacion.end());
    }
    
    if (logFile != "") log.close();
    
    // Retornar mejor global histórico
    return {mejorGlobal.genotipo, mejorGlobal.fitness};
}
