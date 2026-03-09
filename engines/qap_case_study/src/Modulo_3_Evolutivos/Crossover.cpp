#include <vector>
#include <algorithm>
#include <vector>
#include <iostream>

using namespace std;

// Operador de Cruce: Order Crossover (OX)
// Preserva una sub-secuencia del Padre 1 y rellena con el orden relativo del Padre 2.
void cruceOX(const vector<int>& padre1, const vector<int>& padre2, vector<int>& hijo1, vector<int>& hijo2) {
    int n = padre1.size();
    hijo1.assign(n, -1);
    hijo2.assign(n, -1);
    
    // 1. Seleccionar dos puntos de corte aleatorios
    int cut1 = aleatorio(0, n - 2);
    int cut2 = aleatorio(cut1 + 1, n - 1);
    
    // --- Hijo 1 ---
    // Copiar segmento de P1
    vector<bool> enHijo1(n, false);
    for (int i = cut1; i <= cut2; i++) {
        hijo1[i] = padre1[i];
        enHijo1[padre1[i]] = true;
    }
    
    // Rellenar resto con P2 (empezando desde cut2 + 1, circularmente)
    int currentP2 = (cut2 + 1) % n;
    int currentH1 = (cut2 + 1) % n;
    
    while (currentH1 != cut1) {
        int valorP2 = padre2[currentP2];
        if (!enHijo1[valorP2]) {
            hijo1[currentH1] = valorP2;
            currentH1 = (currentH1 + 1) % n;
        }
        currentP2 = (currentP2 + 1) % n;
    }
    
    // --- Hijo 2 (Simétrico: P2 base, P1 relleno) ---
    vector<bool> enHijo2(n, false);
    for (int i = cut1; i <= cut2; i++) {
        hijo2[i] = padre2[i];
        enHijo2[padre2[i]] = true;
    }
    
    int currentP1 = (cut2 + 1) % n;
    int currentH2 = (cut2 + 1) % n;
    
    while (currentH2 != cut1) {
        int valorP1 = padre1[currentP1];
        if (!enHijo2[valorP1]) {
            hijo2[currentH2] = valorP1;
            currentH2 = (currentH2 + 1) % n;
        }
        currentP1 = (currentP1 + 1) % n;
    }
}
