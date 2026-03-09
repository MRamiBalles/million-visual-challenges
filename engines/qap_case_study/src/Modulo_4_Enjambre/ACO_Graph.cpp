#include <vector>
#include <iostream>
#include "TSP_Data.cpp"

using namespace std;

// Grafo ACO centraliza las matrices de información (shared memory environment)
struct ACOGraph {
    int n;
    vector<vector<int>> distancias;
    vector<vector<double>> visibilidad; // eta = 1/d
    vector<vector<double>> feromona;    // tau
    
    // Config
    double alpha = 2.0; // Peso feromona -> Guía dice 1? No, guia dice "alpha=1, beta=2"? 
                        // User prompt anterior: alpha=2, beta=2. User prompt actual: alpha=2, beta=2.
                        // Usaré alpha=2, beta=2 según última instrucción.
    double beta = 2.0;  // Peso visibilidad
    double rho = 0.15;  // Evaporación (User prompt says 0.15)
    double tau0;        // Feromona inicial
    
    void inicializar(const TSPInstance& tsp, double t0) {
        n = tsp.n;
        tau0 = t0;
        distancias.assign(n, vector<int>(n));
        visibilidad.assign(n, vector<double>(n));
        feromona.assign(n, vector<double>(n, tau0));
        
        for(int i=0; i<n; i++) {
            for(int j=i+1; j<n; j++) { // Simétrica
                int d = distanciaEuc(tsp.ciudades[i], tsp.ciudades[j]);
                if(d == 0) d = 1; // Evitar div/0
                
                distancias[i][j] = distancias[j][i] = d;
                visibilidad[i][j] = visibilidad[j][i] = 1.0 / (double)d;
            }
        }
    }
    
    // Evaporación Global: tau = (1-rho)*tau
    void evaporar() {
        double factor = (1.0 - rho);
        for(int i=0; i<n; i++) {
            for(int j=0; j<n; j++) {
                feromona[i][j] *= factor;
                // Clamp mínimo para evitar 0 absoluto (opcional, pero recomendado en ACS/MMAS)
                if (feromona[i][j] < 1e-10) feromona[i][j] = 1e-10; 
            }
        }
    }
    
    // Aporte de Feromona: tau += delta
    void depositar(int i, int j, double delta) {
        feromona[i][j] += delta;
        feromona[j][i] += delta;
    }
};
