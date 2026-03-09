#include <vector>
#include <algorithm>
#include <iostream>
#include <random>

using namespace std;

// Estructura para almacenar movimientos (r, s) y su delta
struct Movimiento {
    int r;
    int s;
    long long delta;
};

// --- Estrategia 1: El Mejor Vecino (Best Improvement) ---
// Explora TODO el vecindario y aplica el mejor movimiento
vector<int> busquedaLocalBestImprovement(vector<int> solucion, const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    int n = solucion.size();
    bool mejora = true;
    
    // Bucle principal: mientras haya mejora
    while(mejora) {
        mejora = false;
        long long mejorDelta = 0;
        int mejorR = -1;
        int mejorS = -1;
        
        // Explorar todo el vecindario (pares r, s)
        for(int r = 0; r < n; r++) {
            for(int s = r + 1; s < n; s++) {
                long long delta = calcularDelta(r, s, solucion, flujo, distancia);
                
                // Buscamos MINIMIZAR el coste, así que delta debe ser negativo
                if (delta < mejorDelta) {
                    mejorDelta = delta;
                    mejorR = r;
                    mejorS = s;
                }
            }
        }
        
        // Si encontramos un movimiento que mejora (delta < 0)
        if (mejorR != -1) {
            // Aplicar movimiento
            swap(solucion[mejorR], solucion[mejorS]);
            mejora = true;
            // Opcional: Recalcular coste total completo aquí para evitar deriva float
             // long long check = evaluarSolucion(solucion, flujo, distancia);
        }
    }
    
    return solucion;
}

// --- Estrategia 2: El Primer Mejor Vecino (First Improvement) ---
// Explora el vecindario en orden ALEATORIO y aplica el primero que mejore
vector<int> busquedaLocalFirstImprovement(vector<int> solucion, const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    int n = solucion.size();
    bool mejora = true;
    
    // Pre-generar todos los pares posibles para barajarlos luego
    vector<pair<int, int>> vecinos;
    vecinos.reserve(n * (n-1) / 2);
    for(int i = 0; i < n; i++) {
        for(int j = i + 1; j < n; j++) {
            vecinos.push_back({i, j});
        }
    }
    
    while(mejora) {
        mejora = false;
        
        // Barajar el orden de visita (Shuffle) para evitar sesgos
        // Usamos el generador global definido en Core/Generador.cpp
        shuffle(vecinos.begin(), vecinos.end(), rng);
        
        for(auto& par : vecinos) {
            int r = par.first;
            int s = par.second;
            
            long long delta = calcularDelta(r, s, solucion, flujo, distancia);
            
            if (delta < 0) {
                // Aplicar inmediatamente (First Improvement)
                swap(solucion[r], solucion[s]);
                mejora = true;
                break; // Reiniciar bucle principal desde la nueva solución
            }
        }
    }
    
    return solucion;
}
