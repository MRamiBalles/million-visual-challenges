#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <iomanip>

// Modules
#include "Core/Generador.cpp"
#include "Core/Lecture.cpp"
#include "Core/Evaluador.cpp"
#include "Modulo_3_Evolutivos/GeneticAlgorithm.cpp"

using namespace std;

// Seeds
const vector<unsigned int> SEEDS = {123456, 987654, 112233, 445566, 778899};

void runAGGTest(int n, string datasetName) {
    cout << "\n=== Test AGG: " << datasetName << " (N=" << n << ") ===\n";
    cout << left << setw(10) << "Seed" << setw(15) << "Best Cost" << setw(15) << "Evaluations" << endl;
    
    // Generar dummy data
    inicializarSemilla(42);
    vector<vector<int>> F(n, vector<int>(n));
    vector<vector<int>> D(n, vector<int>(n));
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i!=j) { F[i][j]=aleatorio(1,100); D[i][j]=aleatorio(1,100); }
    
    ConfigAGG config;
    config.poblacionSize = 50;
    config.maxGeneraciones = 100; // Suficiente para ver convergencia en N=25
    config.probCruce = 0.9;
    config.probMutacion = 0.05; // Bajo, como sugerido

    for(int i=0; i<SEEDS.size(); i++) {
        inicializarSemilla(SEEDS[i]);
        resetEvaluaciones();
        
        string logName = datasetName + "_agg_seed" + to_string(i) + ".csv";
        ResultadoAGG res = geneticoGeneracional(F, D, config, logName);
        
        cout << left << setw(10) << (i+1) 
             << setw(15) << res.mejorCoste 
             << setw(15) << numEvaluaciones << endl;
    }
    cout << "Logs de convergencia generados (*_agg_seed*.csv). Verificar 'MediaFit' vs 'MejorFit' para presión selectiva.\n";
}

int main() {
    cout << "VALIDACION AGG (Sprint 5)\n";
    runAGGTest(25, "Tai25b");
    return 0;
}
