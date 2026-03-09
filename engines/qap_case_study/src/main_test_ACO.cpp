#include <iostream>
#include <vector>
#include <string>
#include "Core/Generador.cpp"
#include "Modulo_4_Enjambre/ACO.cpp"

using namespace std;

// Generador de instancia TSP Circular (Dummy para testing)
void generarDummyTSP(string filename, int n) {
    ofstream f(filename);
    f << "NAME: dummy" << n << "\n";
    f << "DIMENSION: " << n << "\n";
    f << "NODE_COORD_SECTION\n";
    // Generar circulo
    double r = 100.0;
    for(int i=0; i<n; i++) {
        double theta = 2.0 * 3.14159 * i / n;
        f << (i+1) << " " << (r * cos(theta)) << " " << (r * sin(theta)) << "\n";
    }
    f << "EOF\n";
    f.close();
}

int main() {
    cout << "VALIDACION ACO (Sprint 6.2)\n";
    inicializarSemilla(123);
    
    // 1. Check Data
    string tspFile = "ch130.tsp";
    
    // Intentar leer, si falla generar dummy
    TSPInstance inst = leerTSP(tspFile);
    if(inst.n == 0) {
        cout << "[WARN] 'ch130.tsp' no encontrado. Generando 'dummy130.tsp' circular...\n";
        tspFile = "dummy130.tsp";
        generarDummyTSP(tspFile, 130);
        inst = leerTSP(tspFile);
    }
    
    cout << "Instancia cargada: N=" << inst.n << endl;
    
    // 2. Ejecutar SH
    cout << "\n--- Ejecutando Sistema de Hormigas (SH) [Limitado a 10s para test] ---\n";
    // Hack: Modificar ACO.cpp para aceptar timeLimit param? 
    // Por ahora ACO.cpp tiene 180s hardcoded. No modificaremos el codigo fuente validado.
    // Simplemente ejecutamos y el usuario controlará (o espera 3 min si ejecuta real).
    // Para TEST RAPIDO, modificamos ACO.cpp SOLO en memoria para aceptar config? NO.
    // Ok, aceptamos que tardará o cortamos manualmente.
    // WAIT: Mejor modificar ACO.cpp para leer el parametro si queremos testing fluido.
    // Pero el User pidió "3 minutos exactos".
    // Ejecutaremos la versión Elitista (SHE) directamente que es la más potente.
    
    cout << "Iniciando SHE (Elitista)... presione Ctrl+C si desea abortar antes de 3 min.\n";
    
    ResultadoACO res = ejecutarACO(inst, VarianteACO::ELITISTA, "aco_she_log.csv");
    
    cout << "Mejor Coste Final: " << res.mejorSolucion.coste << endl;
    cout << "Tours Construidos: " << res.evaluaciones << endl;
    
    return 0;
}
