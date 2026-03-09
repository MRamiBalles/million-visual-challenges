#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>
#include <cmath>
#include <fstream>

// Incluir Módulos (Unity Build Pattern)
#include "Core/Generador.cpp"
#include "Core/Lecture.cpp"
#include "Core/Evaluador.cpp"

#include "Modulo_1_Trayectorias/Greedy.cpp"
#include "Modulo_1_Trayectorias/RandomSearch.cpp"
#include "Modulo_1_Trayectorias/LocalSearch.cpp"
#include "Modulo_1_Trayectorias/SimulatedAnnealing.cpp"
#include "Modulo_1_Trayectorias/TabuSearch.cpp"

using namespace std;

// Seeds dada por el usuario (Core/Seeds.txt)
const vector<unsigned int> SEEDS = {123456, 987654, 112233, 445566, 778899};

// Estructura para métricas
struct Metricas {
    long long mejorCoste;
    double mediaCoste;
    double tiempoMedio;
    string mejorSolucionStr;
};

// Helper para imprimir barra de progreso
void printProgress(string algo, int seedIdx, int totalSeeds) {
    cout << "\r[" << algo << "] Ejecutando Semilla " << (seedIdx + 1) << "/" << totalSeeds << "..." << flush;
}

// Ejecutor Genérico
template <typename Func>
Metricas ejecutarAlgoritmo(string nombre, Func algoritmo, const vector<vector<int>>& F, const vector<vector<int>>& D, int n, bool usaSemilla = true) {
    long long mejorGlobal = -1;
    double sumaCostes = 0;
    double sumaTiempos = 0;
    
    int ejecuciones = usaSemilla ? SEEDS.size() : 1;
    
    for(int i = 0; i < ejecuciones; i++) {
        printProgress(nombre, i, ejecuciones);
        
        if (usaSemilla) inicializarSemilla(SEEDS[i]);
        
        auto start = chrono::high_resolution_clock::now();
        
        // Ejecutar
        long long coste = algoritmo(i, F, D); // Pasamos índice i para que lógica interna use seed si necesita, o ignore
        
        auto end = chrono::high_resolution_clock::now();
        double tiempo = chrono::duration_cast<chrono::milliseconds>(end - start).count();
        
        if (mejorGlobal == -1 || coste < mejorGlobal) mejorGlobal = coste;
        sumaCostes += coste;
        sumaTiempos += tiempo;
    }
    cout << "\r" << string(50, ' ') << "\r"; // Limpiar linea
    
    return {mejorGlobal, sumaCostes / ejecuciones, sumaTiempos / ejecuciones, ""};
}

int main() {
    cout << "=================================================" << endl;
    cout << "   PRACTICA 1: ALGORITMOS DE TRAYECTORIA (MBHB)  " << endl;
    cout << "=================================================" << endl;
    
    // Dataset Dummy (Simulated Tai25b)
    int n = 25; 
    cout << "Generando Dataset Simulado (N=" << n << ")..." << endl;
    inicializarSemilla(42); // Fijo para el dataset
    vector<vector<int>> F(n, vector<int>(n));
    vector<vector<int>> D(n, vector<int>(n));
    for(int i=0; i<n; i++) for(int j=0; j<n; j++) if(i!=j) { F[i][j]=aleatorio(1,100); D[i][j]=aleatorio(1,100); }

    // Tabla de Resultados
    cout << endl;
    cout << left << setw(20) << "Algoritmo" 
         << setw(15) << "Mejor" 
         << setw(15) << "Media" 
         << setw(15) << "Tiempo(ms)" 
         << setw(15) << "Desviacion" << endl;
    cout << string(80, '-') << endl;

    // --- 1. GREEDY ---
    Metricas mGreedy = ejecutarAlgoritmo("Greedy", [&](int seedIdx, auto& f, auto& d) {
        vector<int> sol = greedyConstructivo(f, d);
        return evaluarSolucion(sol, f, d);
    }, F, D, n, false); // Solo 1 ejecución (determinista)
    
    cout << left << setw(20) << "Greedy (Pot)" 
         << setw(15) << mGreedy.mejorCoste 
         << setw(15) << mGreedy.mediaCoste 
         << setw(15) << mGreedy.tiempoMedio
         << setw(15) << "0.0" << endl;

    // --- 2. RANDOM SEARCH ---
    Metricas mRandom = ejecutarAlgoritmo("Random Search", [&](int seedIdx, auto& f, auto& d) {
        vector<int> sol = busquedaAleatoria(f, d, n);
        return evaluarSolucion(sol, f, d);
    }, F, D, n);
    
    cout << left << setw(20) << "Random (50k)" 
         << setw(15) << mRandom.mejorCoste 
         << setw(15) << mRandom.mediaCoste 
         << setw(15) << mRandom.tiempoMedio 
         << setw(15) << "?" << endl;

    // --- 3. LS BEST IMPROVEMENT ---
    Metricas mBest = ejecutarAlgoritmo("LS Best", [&](int seedIdx, auto& f, auto& d) {
        vector<int> solIni = generarSolucionAleatoria(n);
        vector<int> sol = busquedaLocalBestImprovement(solIni, f, d);
        return evaluarSolucion(sol, f, d);
    }, F, D, n);

    cout << left << setw(20) << "LS Best" 
         << setw(15) << mBest.mejorCoste 
         << setw(15) << mBest.mediaCoste 
         << setw(15) << mBest.tiempoMedio
         << setw(15) << "?" << endl;

    // --- 4. LS FIRST IMPROVEMENT ---
    Metricas mFirst = ejecutarAlgoritmo("LS First", [&](int seedIdx, auto& f, auto& d) {
        vector<int> solIni = generarSolucionAleatoria(n);
        vector<int> sol = busquedaLocalFirstImprovement(solIni, f, d);
        return evaluarSolucion(sol, f, d);
    }, F, D, n);

    cout << left << setw(20) << "LS First" 
         << setw(15) << mFirst.mejorCoste 
         << setw(15) << mFirst.mediaCoste 
         << setw(15) << mFirst.tiempoMedio
         << setw(15) << "?" << endl;

    // --- 5. SIMULATED ANNEALING ---
    Metricas mSA = ejecutarAlgoritmo("Sim. Annealing", [&](int seedIdx, auto& f, auto& d) {
        vector<int> solIni = generarSolucionAleatoria(n);
        ResultadoSA res = simulatedAnnealing(solIni, f, d);
        return res.coste;
    }, F, D, n);

    cout << left << setw(20) << "Sim. Annealing" 
         << setw(15) << mSA.mejorCoste 
         << setw(15) << mSA.mediaCoste 
         << setw(15) << mSA.tiempoMedio
         << setw(15) << "?" << endl;

    // --- 6. TABU SEARCH ---
    Metricas mTabu = ejecutarAlgoritmo("Tabu Search", [&](int seedIdx, auto& f, auto& d) {
        vector<int> solIni = generarSolucionAleatoria(n);
        ResultadoTabu res = tabuSearch(solIni, f, d);
        return res.coste;
    }, F, D, n);

    cout << left << setw(20) << "Tabu Search" 
         << setw(15) << mTabu.mejorCoste 
         << setw(15) << mTabu.mediaCoste 
         << setw(15) << mTabu.tiempoMedio
         << setw(15) << "?" << endl;

    cout << endl << "Benchmark Completado." << endl;
    return 0;
}
