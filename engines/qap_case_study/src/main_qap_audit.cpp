#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>

// Unity Build: Incluimos los fuentes directamente para simplificar el proceso de auditoría
#include "Core/Generador.cpp"
#include "Core/Lecture.cpp"
#include "Core/Evaluador.cpp"

#include "Modulo_1_Trayectorias/Greedy.cpp"
#include "Modulo_1_Trayectorias/LocalSearch.cpp"

using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Uso: " << argv[0] << " <archivo_instancia.dat>" << endl;
        return 1;
    }

    string rutaInstancia = argv[1];
    
    // 1. CARGA DE INSTANCIA
    QAPInstance instancia = leerInstancia(rutaInstancia);
    if (instancia.n == 0) return 1;

    cout << "=================================================" << endl;
    cout << "   AUDITORIA TOPOLOGICA QAP (MILLION CHALLENGES) " << endl;
    cout << "=================================================" << endl;
    cout << "Instancia: " << rutaInstancia << " (N=" << instancia.n << ")" << endl;
    cout << "-------------------------------------------------" << endl;

    // 2. EJECUCION GREEDY (CLASE P - CONTRACTIBILIDAD)
    auto startG = chrono::high_resolution_clock::now();
    vector<int> solGreedy = greedyConstructivo(instancia.flujo, instancia.distancia);
    auto endG = chrono::high_resolution_clock::now();
    long long costeGreedy = evaluarSolucion(solGreedy, instancia.flujo, instancia.distancia);
    double tiempoG = chrono::duration_cast<chrono::milliseconds>(endG - startG).count();

    // 3. EJECUCION LOCAL SEARCH (CLASE NP - OBSTRUCCION)
    inicializarSemilla(123456); // Semilla fija para auditoría reproducible
    vector<int> solIni = generarSolucionAleatoria(instancia.n);
    
    auto startLS = chrono::high_resolution_clock::now();
    vector<int> solLS = busquedaLocalBestImprovement(solIni, instancia.flujo, instancia.distancia);
    auto endLS = chrono::high_resolution_clock::now();
    long long costeLS = evaluarSolucion(solLS, instancia.flujo, instancia.distancia);
    double tiempoLS = chrono::duration_cast<chrono::milliseconds>(endLS - startLS).count();

    // 4. CALCULO DEL GAP (BARRERA EPISTEMICA)
    double gap = 0;
    if (costeLS != 0) {
        gap = ((double)(costeGreedy - costeLS) / (double)costeLS) * 100.0;
    }

    // 5. REPORTE FINAL
    cout << left << setw(20) << "Metodo" << setw(15) << "Coste" << setw(15) << "Tiempo(ms)" << endl;
    cout << string(50, '-') << endl;
    cout << left << setw(20) << "Greedy (P)" << setw(15) << costeGreedy << setw(15) << tiempoG << endl;
    cout << left << setw(20) << "LS Best (NP)" << setw(15) << costeLS << setw(15) << tiempoLS << endl;
    cout << string(50, '-') << endl;
    cout << "OBSTRUCCION DETECTADA (GAP): " << fixed << setprecision(2) << gap << "%" << endl;
    
    if (gap > 20.0) {
        cout << "RESULTADO: Alta rugosidad detectada. Evidencia de H1 != 0." << endl;
    } else {
        cout << "RESULTADO: Paisaje suave o instancia trivial." << endl;
    }
    
    return 0;
}
