#include <vector>
#include <algorithm>
#include <random>
#include <chrono>

using namespace std;

// Generador de Números Aleatorios Global
mt19937 rng;

void inicializarSemilla(unsigned int seed) {
    if (seed == 0) {
        rng.seed(chrono::steady_clock::now().time_since_epoch().count());
    } else {
        rng.seed(seed);
    }
}

// Generar una solución aleatoria (permutación de 0 a n-1)
vector<int> generarSolucionAleatoria(int n) {
    vector<int> solucion(n);
    for (int i = 0; i < n; i++) {
        solucion[i] = i;
    }
    shuffle(solucion.begin(), solucion.end(), rng);
    return solucion;
}

// Obtener un entero aleatorio en [min, max]
int aleatorio(int min, int max) {
    uniform_int_distribution<int> dist(min, max);
    return dist(rng);
}

// Obtener un float aleatorio en [0, 1]
double aleatorioUniforme() {
    uniform_real_distribution<double> dist(0.0, 1.0);
    return dist(rng);
}
