#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <iomanip>

// Includes - Unity Build Style
#include "Core/Generador.cpp"
#include "Core/Lecture.cpp"
#include "Core/Evaluador.cpp"
#include "Modulo_2_Multiarranque/Diversity.cpp"
#include "Modulo_2_Multiarranque/Mutation.cpp" 
#include "Modulo_3_Evolutivos/Crossover.cpp"
#include "Modulo_3_Evolutivos/CHCAlgorithm.cpp"

using namespace std;

void runCHCTest(int n, string datasetName) {
    cout << "\n=== Test CHC: " << datasetName << " (N=" << n << ") ===\n";
    cout << left << setw(10) << "Seed" << setw(15) << "Best Cost" << setw(15) << "Evals" << endl;
    
    // Dummy Data
    inicializarSemilla(42);
    vector<vector<int>> F(n, vector<int>(n));
    vector<vector<int>> D(n, vector<int>(n));
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i!=j) { F[i][j]=aleatorio(1,100); D[i][j]=aleatorio(1,100); }
    
    ConfigCHC config;
    config.poblacionSize = 50;
    config.maxEvaluaciones = 20000; // Suficiente para provocar cataclismos en N=25

    // Seeds from Core/Seeds.txt logic (using hardcoded vector for simplicity here)
    vector<unsigned int> seeds = {123456, 987654, 112233, 445566, 778899};

    for(int i=0; i<seeds.size(); i++) {
        inicializarSemilla(seeds[i]);
        resetEvaluaciones(); // Reset global counter if needed, though CHC tracks its own loop
        
        string logName = datasetName + "_chc_seed" + to_string(i) + ".csv";
        
        ResultadoCHC res = algoritmoCHC(F, D, config, logName);
        
        // Usamos el contador interno del algoritmo o el global? CHC tiene parada interna por config.maxEvaluaciones.
        // Pero Evaluador.cpp cuenta globalmente también. Usamos el config limit para mostrar.
        
        cout << left << setw(10) << (i+1) 
             << setw(15) << res.mejorCoste 
             << setw(15) << config.maxEvaluaciones << endl;
    }
    cout << "Logs generados. Buscar saltos en 'MejorCoste' o flags 'EsCataclismo' en los CSV.\n";
}

int main() {
    cout << "VALIDACION CHC (Sprint 5.5)\n";
    runCHCTest(25, "Tai25b");
    return 0;
}
