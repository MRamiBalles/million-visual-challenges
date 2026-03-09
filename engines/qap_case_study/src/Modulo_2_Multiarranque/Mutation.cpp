#include <vector>
#include <algorithm>
#include <random>
#include <iostream>

using namespace std;

// Operador de Mutación: Sublista Aleatoria
// Selecciona una sublista de tamaño 's' (circular) y la permuta aleatoriamente.
void mutarSublista(vector<int>& solucion, int s) {
    int n = solucion.size();
    if (s <= 1 || s > n) return; // Validación básica
    
    // Elegir posición inicial aleatoria
    int inicio = aleatorio(0, n - 1);
    
    // Extraer valores de la sublista circular
    vector<int> valores;
    valores.reserve(s);
    vector<int> indices;
    indices.reserve(s);
    
    for (int k = 0; k < s; k++) {
        int idx = (inicio + k) % n; // Circularidad
        indices.push_back(idx);
        valores.push_back(solucion[idx]);
    }
    
    // Barajar valores (Shuffle)
    shuffle(valores.begin(), valores.end(), rng);
    
    // Reinsertar valores permutados
    for (int k = 0; k < s; k++) {
        solucion[indices[k]] = valores[k];
    }
}
