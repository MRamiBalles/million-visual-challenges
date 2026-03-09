#include <vector>
#include <algorithm>
#include <iostream>
#include <fstream>
#include "Diversity.cpp"

using namespace std;

// --- GRASP Instrumentado ---

// Re-declaración necesaria si no usamos headers propriamente en esta compilación por inclusión
// Dependencia: construccionGreedyAleatorizada (de la version anterior, aqui la incluimos completa modificada)

// 1. Construcción Greedy Aleatorizada (LRC)
vector<int> construccionGreedyAleatorizada(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, float alpha) {
    int n = flujo.size();
    vector<int> solucion(n, -1);
    
    // Calcular Potenciales (recalcualdo cada vez para simplicidad, optimizable)
    vector<ElementoCandidato> potFlujo(n);
    for(int i=0; i<n; i++) {
        potFlujo[i].id = i; 
        potFlujo[i].potencial = 0;
        for(int j=0; j<n; j++) potFlujo[i].potencial += flujo[i][j] + flujo[j][i];
    }
    sort(potFlujo.begin(), potFlujo.end(), comparePotMayor);
    
    vector<ElementoCandidato> potDist(n);
    for(int k=0; k<n; k++) {
        potDist[k].id = k; 
        potDist[k].potencial = 0;
        for(int l=0; l<n; l++) potDist[k].potencial += distancia[k][l] + distancia[l][k];
    }
    // Para distancia, queremos asociar ALTO flujo con BAJA distancia (Centro)
    // Ordenamos distancias de MENOR a MAYOR (0=Centro, n=Periferia)
    sort(potDist.begin(), potDist.end(), comparePotMenor); 
    
    // LRC logic
    vector<bool> locacionOcupada(n, false);
    
    for(int i=0; i<n; i++) {
        int unidad = potFlujo[i].id;
        
        vector<ElementoCandidato> locacionesDisponibles;
        for(int k=0; k<n; k++) {
            if(!locacionOcupada[potDist[k].id]) locacionesDisponibles.push_back(potDist[k]);
        }
        
        // LRC Size: alpha * |LRC|
        int nDisp = locacionesDisponibles.size();
        // Corrección documento: LRC = 0.1 * n (Fijo? O proporcional a disponibles?)
        // Guia dice "Tamaño lista l = 0.1 * n".
        // Si alpha se pasa como 0.1, entonces:
        int lrcSize = max(1, (int)(alpha * n)); 
        if (lrcSize > nDisp) lrcSize = nDisp;
        
        int indexAleatorio = aleatorio(0, lrcSize - 1);
        int locacionElegida = locacionesDisponibles[indexAleatorio].id;
        
        solucion[unidad] = locacionElegida;
        locacionOcupada[locacionElegida] = true;
    }
    return solucion;
}

struct ResultadoGRASP {
    vector<int> solucion;
    long long coste;
};

// GRASP con Logging
ResultadoGRASP grasp(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, int maxIter, float alpha, string logFile = "") {
    vector<int> mejorSolucion;
    long long mejorCoste = -1;
    
    ofstream log;
    if(logFile != "") {
        log.open(logFile);
        log << "Iter,CosteConstructivo,CosteLocal,HammingVsBest\n";
    }
    
    for(int i = 0; i < maxIter; i++) {
        // Constructiva
        vector<int> sol = construccionGreedyAleatorizada(flujo, distancia, alpha);
        long long costeConst = evaluarSolucion(sol, flujo, distancia);
        
        // Análisis de Diversidad: Hamming vs Mejor actual
        int hamm = 0;
        if (mejorCoste != -1) hamm = distanciaHamming(sol, mejorSolucion);
        
        // Mejora
        sol = busquedaLocalBestImprovement(sol, flujo, distancia);
        long long costeLocal = evaluarSolucion(sol, flujo, distancia);
        
        if (logFile != "") {
            log << i << "," << costeConst << "," << costeLocal << "," << hamm << "\n";
        }
        
        if (mejorCoste == -1 || costeLocal < mejorCoste) {
            mejorCoste = costeLocal;
            mejorSolucion = sol;
        }
    }
    
    if(logFile != "") log.close();
    return {mejorSolucion, mejorCoste};
}
