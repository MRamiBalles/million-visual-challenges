#include <vector>
#include <iostream>

using namespace std;

// Distancia de Hamming para Permutaciones
// Devuelve el número de posiciones donde las soluciones difieren.
// Rango: [0, n] (0 = idénticas, n = totalmente diferentes)
int distanciaHamming(const vector<int>& solA, const vector<int>& solB) {
    int dist = 0;
    int n = solA.size(); // Asumimos mismo tamaño
    
    for(int i = 0; i < n; i++) {
        if (solA[i] != solB[i]) {
            dist++;
        }
    }
    return dist;
}

// Cálculo de entropía/diversidad de una población (Opcional para Evolutivos)
double diversidadPoblacion(const vector<vector<int>>& poblacion) {
    long long sumaDist = 0;
    int count = 0;
    int p = poblacion.size();
    
    for(int i = 0; i < p; i++) {
        for(int j = i+1; j < p; j++) {
            sumaDist += distanciaHamming(poblacion[i], poblacion[j]);
            count++;
        }
    }
    
    return count > 0 ? (double)sumaDist / count : 0.0;
}
