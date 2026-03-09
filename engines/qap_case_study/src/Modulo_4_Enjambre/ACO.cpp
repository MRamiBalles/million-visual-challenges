#include <vector>
#include <iostream>
#include <algorithm>
#include <chrono>
#include <fstream>
#include "ACO_Graph.cpp"
#include "Ant.cpp"

using namespace std;

// TSP Greedy (Nearest Neighbor) para Tau0
long long tspGreedy(const TSPInstance& inst) {
    int n = inst.n;
    if(n==0) return 0;
    
    vector<bool> visited(n, false);
    int current = 0;
    visited[0] = true;
    long long cost = 0;
    
    for(int i=1; i<n; i++) {
        int bestNext = -1;
        int minD = 999999999;
        
        for(int j=0; j<n; j++) {
            if(!visited[j]) {
                int d = distanciaEuc(inst.ciudades[current], inst.ciudades[j]);
                if (d < minD) {
                    minD = d;
                    bestNext = j;
                }
            }
        }
        current = bestNext;
        visited[current] = true;
        cost += minD;
    }
    // Cerrar
    cost += distanciaEuc(inst.ciudades[current], inst.ciudades[0]);
    return cost;
}

// Configuración Variante
enum class VarianteACO { SYSTEMA_HORMIGAS, ELITISTA };

struct ResultadoACO {
    SolucionTSP mejorSolucion;
    long long evaluaciones; // Iteraciones o tours construidos
};

ResultadoACO ejecutarACO(const TSPInstance& inst, VarianteACO variante, string logFile = "") {
    int n = inst.n;
    int m = 30; // Numero de hormigas (Guía)
    
    // 1. Inicialización Greedy para Tau0
    long long greedyCost = tspGreedy(inst);
    double tau0 = 1.0 / (double)(n * greedyCost);
    
    cout << "[ACO] Greedy Init Cost: " << greedyCost << " -> Tau0: " << tau0 << endl;
    
    ACOGraph grafo;
    grafo.inicializar(inst, tau0);
    
    SolucionTSP mejorGlobal;
    mejorGlobal.coste = -1;
    
    vector<Hormiga> colonia(m, Hormiga(n));
    
    ofstream log;
    if(logFile != "") {
        log.open(logFile);
        log << "TimeSec,MejorCoste\n";
    }
    
    // Control de Tiempo (3 min = 180 seg)
    auto start = chrono::high_resolution_clock::now();
    double timeLimitSec = 180.0; 
    
    int iteracion = 0;
    
    while(true) {
        // Check tiempo
        auto now = chrono::high_resolution_clock::now();
        double elapsed = chrono::duration<double>(now - start).count();
        if (elapsed > timeLimitSec) break;
        
        iteracion++;
        
        // --- 1. Construcción de Soluciones ---
        // Paralelizable en OpenMP si se quisiera, pero secuencial por ahora
        for(int k=0; k<m; k++) {
            colonia[k].reset();
            colonia[k].construirTour(grafo);
            
            // Actualizar Global
            if (mejorGlobal.coste == -1 || colonia[k].tour.coste < mejorGlobal.coste) {
                mejorGlobal = colonia[k].tour;
                cout << "Nueva Mejor (Iter " << iteracion << "): " << mejorGlobal.coste << " [" << elapsed << "s]" << endl;
            }
        }
        
        // --- 2. Evaporación ---
        grafo.evaporar();
        
        // --- 3. Aporte de Feromona ---
        
        // A) Todas las hormigas aportan (Sistema SH)
        for(int k=0; k<m; k++) {
            double delta = 1.0 / (double)colonia[k].tour.coste;
            const vector<int>& ruta = colonia[k].tour.camino;
            for(int i=0; i<n; i++) {
                int u = ruta[i];
                int v = ruta[(i+1)%n]; // Ciclo
                grafo.depositar(u, v, delta);
            }
        }
        
        // B) Aporte Elitista (Solo SHE)
        if (variante == VarianteACO::ELITISTA) {
            // Peso: e * contribucion_mejor
            // Guia: e = m (30)
            double deltaElite = (double)m * (1.0 / (double)mejorGlobal.coste); // Peso aumentado
            const vector<int>& ruta = mejorGlobal.camino;
            for(int i=0; i<n; i++) {
                int u = ruta[i];
                int v = ruta[(i+1)%n];
                grafo.depositar(u, v, deltaElite);
            }
        }
        
        if (logFile != "") {
            log << elapsed << "," << mejorGlobal.coste << "\n";
        }
    }
    
    if(logFile != "") log.close();
    return {mejorGlobal, (long long)iteracion * m};
}
