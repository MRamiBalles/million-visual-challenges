#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <fstream>
#include <iomanip>
#include "Core/Lecture.cpp"
#include "Core/Generador.cpp"
#include "Core/Evaluador.cpp"
#include "Modulo_1_Trayectorias/Greedy.cpp"
#include "Modulo_1_Trayectorias/RandomSearch.cpp"

using namespace std;

void runBenchmark(string datasetName, string path) {
    cout << "--- Benchmark: " << datasetName << " ---" << endl;
    QAPInstance qap = leerInstancia(path);
    if(qap.n == 0) return; // Error reading

    // Tabla Header
    cout << left << setw(15) << "Algoritmo" 
         << setw(15) << "Mejor" 
         << setw(15) << "Media" 
         << setw(15) << "Tiempo(ms)" << endl;

    // 1. GREEDY
    auto start = chrono::high_resolution_clock::now();
    vector<int> solGreedy = greedyConstructivo(qap.flujo, qap.distancia);
    auto end = chrono::high_resolution_clock::now();
    long long costeGreedy = evaluarSolucion(solGreedy, qap.flujo, qap.distancia);
    
    cout << left << setw(15) << "Greedy Pot" 
         << setw(15) << costeGreedy 
         << setw(15) << costeGreedy 
         << setw(15) << chrono::duration_cast<chrono::milliseconds>(end-start).count() << endl;

    // 2. RANDOM SEARCH (5 seeds)
    vector<long long> costesRandom;
    long long mejorRandom = -1;
    start = chrono::high_resolution_clock::now();
    
    for(int i=0; i<5; i++) {
        inicializarSemilla(i+1); // Simple seed var
        vector<int> sol = busquedaAleatoria(qap.flujo, qap.distancia, qap.n);
        long long c = evaluarSolucion(sol, qap.flujo, qap.distancia);
        costesRandom.push_back(c);
        if(mejorRandom == -1 || c < mejorRandom) mejorRandom = c;
    }
    end = chrono::high_resolution_clock::now();
    
    double mediaRandom = 0;
    for(long long c : costesRandom) mediaRandom += c;
    mediaRandom /= 5.0;
    
    cout << left << setw(15) << "Random(50k)" 
         << setw(15) << mejorRandom 
         << setw(15) << mediaRandom 
         << setw(15) << chrono::duration_cast<chrono::milliseconds>(end-start).count() / 5.0 << endl;
    
    cout << endl;
}

int main() {
    // Como no tenemos los archivos .dat reales, generamos dummy files para probar
    // En produccion: runBenchmark("Tai25b", "Data/tai25b.dat");
    cout << "AVISO: Ejecutando con datos simulados (no se encontraron .dat reales)" << endl;
    
    // Crear archivo dummy si no existe
    ofstream dummy("dummy.dat");
    dummy << "5\n"; // n=5
    // Flow
    for(int i=0;i<5;i++){ for(int j=0;j<5;j++) dummy << (i==j?0:rand()%10) << " "; dummy << "\n"; }
    // Dist
    for(int i=0;i<5;i++){ for(int j=0;j<5;j++) dummy << (i==j?0:rand()%10) << " "; dummy << "\n"; }
    dummy.close();
    
    runBenchmark("DummyTest", "dummy.dat");
    
    return 0;
}
