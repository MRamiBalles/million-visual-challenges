#include <vector>
#include <algorithm>
#include <numeric>
#include <iostream>

using namespace std;

struct Elemento {
    int id;
    long long potencial;
};

// Comparadores
bool compararMayorMenor(const Elemento& a, const Elemento& b) {
    return a.potencial > b.potencial; // Mayor flujo primero
}

bool compararMenorMayor(const Elemento& a, const Elemento& b) {
    return a.potencial < b.potencial; // Menor distancia (más céntrico) primero
}

vector<int> greedyConstructivo(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    int n = flujo.size();
    
    // 1. Calcular Potenciales de Flujo (Suma de flujos de cada unidad i)
    vector<Elemento> potFlujo(n);
    for(int i=0; i<n; i++) {
        potFlujo[i].id = i;
        potFlujo[i].potencial = 0;
        for(int j=0; j<n; j++) {
            potFlujo[i].potencial += flujo[i][j] + flujo[j][i]; // Flujo total
        }
    }
    
    // 2. Calcular Potenciales de Distancia (Suma de distancias de cada locación k)
    vector<Elemento> potDistancia(n);
    for(int k=0; k<n; k++) {
        potDistancia[k].id = k;
        potDistancia[k].potencial = 0;
        for(int l=0; l<n; l++) {
            potDistancia[k].potencial += distancia[k][l] + distancia[l][k]; // Distancia total
        }
    }
    
    // 3. Ordenar
    // Unidades: Mayor Flujo -> Menor Flujo
    sort(potFlujo.begin(), potFlujo.end(), compararMayorMenor);
    
    // Locaciones: Menor Distancia (Céntricas) -> Mayor Distancia (Periféricas)
    sort(potDistancia.begin(), potDistancia.end(), compararMenorMayor);
    
    // 4. Asignar
    // La unidad con más flujo (potFlujo[0]) va a la locación más céntrica (potDistancia[0])
    vector<int> solucion(n);
    for(int i=0; i<n; i++) {
        int unidad = potFlujo[i].id;
        int locacion = potDistancia[i].id;
        solucion[unidad] = locacion;
    }
    
    return solucion;
}
