#include <vector>
#include <iostream>
#include <fstream>
#include "Mutation.cpp"

using namespace std;

struct ResultadoILS {
    vector<int> solucion;
    long long coste;
};

ResultadoILS iteratedLocalSearch(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, int n, string logFile = "") {
    ofstream log;
    if(logFile != "") {
        log.open(logFile);
        log << "Iter,CosteActual,MejorGlobal,DistanciaHammingAnt\n";
    }

    // 1. Inicial
    vector<int> solActual = generarSolucionAleatoria(n);
    solActual = busquedaLocalBestImprovement(solActual, flujo, distancia);
    long long costeActual = evaluarSolucion(solActual, flujo, distancia);
    
    vector<int> mejorGlobal = solActual;
    long long costeMejorGlobal = costeActual;
    
    int iteraciones = 9; 
    
    if(logFile != "") log << "0," << costeActual << "," << costeMejorGlobal << ",0\n";
    
    for(int i = 0; i < iteraciones; i++) {
        vector<int> solCandidata = mejorGlobal; 
        
        // 2. Perturbación
        int tamSublista = n / 4;
        mutarSublista(solCandidata, tamSublista);
        
        // 3. BL
        solCandidata = busquedaLocalBestImprovement(solCandidata, flujo, distancia);
        long long costeCandidata = evaluarSolucion(solCandidata, flujo, distancia);
        
        // Stats
        int hamm = distanciaHamming(solCandidata, mejorGlobal); // Cuánto nos alejamos del mejor anterior?
        
        // 4. Aceptación
        if (costeCandidata < costeMejorGlobal) {
            mejorGlobal = solCandidata;
            costeMejorGlobal = costeCandidata;
        }
        
        if(logFile != "") log << (i+1) << "," << costeCandidata << "," << costeMejorGlobal << "," << hamm << "\n";
    }
    
    if(logFile != "") log.close();
    return {mejorGlobal, costeMejorGlobal};
}
