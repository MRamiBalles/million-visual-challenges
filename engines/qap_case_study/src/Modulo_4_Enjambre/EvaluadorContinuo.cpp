#include <vector>
#include <cmath>
#include <iostream>

using namespace std;

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Función de Rastrigin
// f(x) = 10d + Sum[x_i^2 - 10cos(2pi*x_i)]
// Dominio: [-5.12, 5.12]
// Mínimo Global: 0 en x=[0,0,...,0]

double evaluadorRastrigin(const vector<double>& x) {
    int d = x.size();
    double sum = 0.0;
    
    for (int i = 0; i < d; i++) {
        sum += (x[i] * x[i]) - (10.0 * cos(2.0 * M_PI * x[i]));
    }
    
    return 10.0 * d + sum;
}
