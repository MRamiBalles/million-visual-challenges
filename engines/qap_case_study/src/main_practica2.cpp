#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>
#include <fstream>

// Modules
#include "Core/Generador.cpp"
#include "Core/Lecture.cpp"
#include "Core/Evaluador.cpp"
#include "Modulo_1_Trayectorias/Greedy.cpp"
#include "Modulo_1_Trayectorias/LocalSearch.cpp" // Best Improvement needed for Multi-start
#include "Modulo_2_Multiarranque/GRASP.cpp"
#include "Modulo_2_Multiarranque/ILS.cpp"
#include "Modulo_2_Multiarranque/VNS.cpp"

using namespace std;

// Ejecutor unificado
void benchmarkInstance(int n, string datasetName) {
    cout << "\n=== Instance: " << datasetName << " (N=" << n << ") ===\n";
    cout << left << setw(15) << "Algoritmo" << setw(15) << "Coste" << setw(15) << "Tiempo(s)" << setw(15) << "Evals" << endl;
    cout << string(60, '-') << endl;
    
    // Generar datos dummy consistentes
    inicializarSemilla(123);
    vector<vector<int>> F(n, vector<int>(n));
    vector<vector<int>> D(n, vector<int>(n));
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i!=j) { F[i][j]=aleatorio(1,100); D[i][j]=aleatorio(1,100); }
    
    // 1. GREEDY (Baseline)
    resetEvaluaciones();
    auto t1 = chrono::high_resolution_clock::now();
    vector<int> solGreedy = greedyConstructivo(F, D);
    long long cGreedy = evaluarSolucion(solGreedy, F, D);
    auto t2 = chrono::high_resolution_clock::now();
    cout << left << setw(15) << "Greedy" 
         << setw(15) << cGreedy 
         << setw(15) << chrono::duration<double>(t2-t1).count() 
         << setw(15) << numEvaluaciones << endl;
         
    // 2. Local Search First Imp (Baseline P1)
    resetEvaluaciones();
    t1 = chrono::high_resolution_clock::now();
    vector<int> solLS = generarSolucionAleatoria(n); // Random start
    solLS = busquedaLocalFirstImprovement(solLS, F, D);
    long long cLS = evaluarSolucion(solLS, F, D);
    t2 = chrono::high_resolution_clock::now();
    cout << left << setw(15) << "LS First" 
         << setw(15) << cLS 
         << setw(15) << chrono::duration<double>(t2-t1).count() 
         << setw(15) << numEvaluaciones << endl;

    // 3. GRASP (25 iterations) - Log diversity
    resetEvaluaciones();
    t1 = chrono::high_resolution_clock::now();
    ResultadoGRASP resGRASP = grasp(F, D, 25, 0.1f, datasetName + "_grasp.csv"); // alpha=0.1
    t2 = chrono::high_resolution_clock::now();
    cout << left << setw(15) << "GRASP" 
         << setw(15) << resGRASP.coste 
         << setw(15) << chrono::duration<double>(t2-t1).count() 
         << setw(15) << numEvaluaciones << endl;

    // 4. ILS (10 restarts) - Log evolution
    resetEvaluaciones();
    t1 = chrono::high_resolution_clock::now();
    ResultadoILS resILS = iteratedLocalSearch(F, D, n, datasetName + "_ils.csv");
    t2 = chrono::high_resolution_clock::now();
    cout << left << setw(15) << "ILS" 
         << setw(15) << resILS.coste 
         << setw(15) << chrono::duration<double>(t2-t1).count() 
         << setw(15) << numEvaluaciones << endl;

    // 5. VNS (Variable) - Log K
    resetEvaluaciones();
    t1 = chrono::high_resolution_clock::now();
    ResultadoVNS resVNS = variableNeighborhoodSearch(F, D, n, datasetName + "_vns.csv");
    t2 = chrono::high_resolution_clock::now();
    cout << left << setw(15) << "VNS" 
         << setw(15) << resVNS.coste 
         << setw(15) << chrono::duration<double>(t2-t1).count() 
         << setw(15) << numEvaluaciones << endl;
}

int main() {
    cout << "INICIO BENCHMARK PRACTICA 2A (Multiarranque)\n";
    cout << "Generando archivos de log (*.csv) para analisis..." << endl;
    
    // Simultamos los 3 datasets de la asignatura
    benchmarkInstance(25, "Tai25b");
    benchmarkInstance(90, "Sko90");
    benchmarkInstance(150, "Tai150b");
    
    cout << "\nBenchmark Finalizado. Revise los archivos .csv generados.\n";
    return 0;
}
