#include <vector>
#include <iostream>

using namespace std;

// Búsqueda Aleatoria: Genera soluciones al azar y se queda con la mejor
// Iteraciones: 1000 * n
vector<int> busquedaAleatoria(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, int n) {
    vector<int> mejorSolucion;
    long long mejorCoste = -1;
    
    int maxIter = 1000 * n;
    
    for(int i=0; i < maxIter; i++) {
        vector<int> sol = generarSolucionAleatoria(n);
        long long coste = evaluarSolucion(sol, flujo, distancia);
        
        if (mejorCoste == -1 || coste < mejorCoste) {
            mejorCoste = coste;
            mejorSolucion = sol;
        }
    }
    
    return mejorSolucion;
}
