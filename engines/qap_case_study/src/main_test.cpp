#include <iostream>
#include <vector>
#include <string>
#include "Core/Lecture.cpp"
#include "Core/Generador.cpp"
#include "Core/Evaluador.cpp"

using namespace std;

int main() {
    cout << "=== Modelos Bioinspirados: QAP Test ===" << endl;
    
    // 1. Setup
    inicializarSemilla(123456); // Seed fija
    
    // 2. Carga Simulada (usando matrices dummy si no hay archivo)
    // En real usariamos leerInstancia("Data/tai25a.dat")
    cout << "Generando instancia aleatoria (N=5)..." << endl;
    int n = 5;
    
    vector<vector<int>> F(n, vector<int>(n));
    vector<vector<int>> D(n, vector<int>(n));
    
    // Rellenar matrices dummy
    for(int i=0; i<n; i++) {
        for(int j=0; j<n; j++) {
            if(i!=j) {
                F[i][j] = aleatorio(1, 10);
                D[i][j] = aleatorio(1, 10);
            }
        }
    }
    
    // 3. Generar Solución
    vector<int> sol = generarSolucionAleatoria(n);
    cout << "Solucion Aleatoria: ";
    for(int x : sol) cout << x << " ";
    cout << endl;
    
    // 4. Evaluar
    long long coste = evaluarSolucion(sol, F, D);
    cout << "Coste Total: " << coste << endl;
    
    // 5. Test Delta (Intercambio 0 y 1)
    cout << "Testing Delta Evaluation (Swap 0,1)..." << endl;
    long long delta = calcularDelta(0, 1, sol, F, D);
    
    // Aplicar cambio real
    swap(sol[0], sol[1]);
    long long coste_nuevo = evaluarSolucion(sol, F, D);
    
    cout << "Delta Calculado: " << delta << endl;
    cout << "Diferencia Real: " << (coste_nuevo - coste) << endl;
    
    if (delta == (coste_nuevo - coste)) {
        cout << "[OK] Delta Evaluation es correcta." << endl;
    } else {
        cout << "[ERROR] Fallo en Delta Evaluation." << endl;
    }

    return 0;
}
