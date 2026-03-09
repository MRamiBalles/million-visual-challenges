#include <vector>
#include <iostream>
#include <fstream>
// Asumimos Mutation incluida

using namespace std;

struct ResultadoVNS {
    vector<int> solucion;
    long long coste;
};

ResultadoVNS variableNeighborhoodSearch(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, int n, string logFile = "") {
    ofstream log;
    if(logFile != "") {
        log.open(logFile);
        log << "Iter,K_Usado,CosteObtenido,Mejora,CosteActual\n";
    }

    vector<int> solActual = generarSolucionAleatoria(n);
    solActual = busquedaLocalBestImprovement(solActual, flujo, distancia);
    long long costeActual = evaluarSolucion(solActual, flujo, distancia);
    
    int k = 1;
    int kMax = 5;
    int maxFallos = 50; 
    int iter = 0;
    
    while (iter < maxFallos) {
        int tamSublista = n / (9 - k);
        if (tamSublista < 2) tamSublista = 2;
        
        vector<int> solVecino = solActual;
        mutarSublista(solVecino, tamSublista);
        
        vector<int> solOptima = busquedaLocalBestImprovement(solVecino, flujo, distancia);
        long long costeOptimo = evaluarSolucion(solOptima, flujo, distancia);
        
        bool mejora = (costeOptimo < costeActual);
        
        // Log antes de actualizar
        if(logFile != "") {
             log << iter << "," << k << "," << costeOptimo << "," << (mejora?"SI":"NO") << "," << costeActual << "\n";
        }

        if (mejora) {
            solActual = solOptima;
            costeActual = costeOptimo;
            k = 1;
            iter++; 
        } else {
            k++;
            if (k > kMax) {
                k = 1;
                iter++; // Contamos iteración completa al barrer entornos o resetear
            }
        }
    }
    
    if(logFile != "") log.close();
    return {solActual, costeActual};
}
