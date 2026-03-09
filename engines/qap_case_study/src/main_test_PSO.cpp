#include <iostream>
#include <vector>
#include <string>
#include <iomanip>

// Includes
#include "Core/Generador.cpp"
#include "Modulo_4_Enjambre/PSO.cpp"

using namespace std;

void runPSOTest() {
    cout << "\n=== Test PSO: Rastrigin Function ===\n";
    cout << left << setw(10) << "Dim" << setw(15) << "Best Cost" << setw(15) << "Time?" << endl;
    
    inicializarSemilla(123456);
    
    // Test Dimensions 10 and 20 (or 30 as usually requested)
    vector<int> dims = {10, 30};
    
    for(int d : dims) {
        ConfigPSO config;
        config.dimensiones = d;
        config.numParticulas = 30;
        config.maxIteraciones = 1000; // Increase iter slightly for 30D
        
        ResultadoPSO res = ejecutarPSO(config, "pso_dim" + to_string(d) + ".csv");
        
        cout << left << setw(10) << d 
             << setw(15) << res.mejorCoste << endl;
    }
    cout << "Logs generated for convergence (pso_dim*.csv).\n";
}

int main() {
    cout << "VALIDACION PSO (Sprint 6.1)\n";
    runPSOTest();
    return 0;
}
