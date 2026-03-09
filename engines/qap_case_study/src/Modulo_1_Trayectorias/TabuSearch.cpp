#include <vector>
#include <deque>
#include <iostream>
#include <algorithm>

using namespace std;

// --- Búsqueda Tabú (Tabu Search) ---
struct ResultadoTabu {
    vector<int> solucion;
    long long coste;
};

// Matriz de Tenencia Tabú: tabuMatrix[i][j] = iteración hasta la cual el movimiento (i, j) está prohibido
// NOTA: Para QAP swap(i,j), prohibimos deshacerlo, es decir, prohibimos mover las unidades u_i, u_j asignadas.
// Implementación simple: Lista Tabú circular de movimientos inversos.

ResultadoTabu tabuSearch(vector<int> solInicial, const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    int n = solInicial.size();
    
    // Estado
    vector<int> actual = solInicial;
    long long costeActual = evaluarSolucion(actual, flujo, distancia);
    
    vector<int> mejorGlobal = actual;
    long long costeMejorGlobal = costeActual;
    
    // Parámetros
    int teneciaTabu = n / 2; // Dinámica básica
    vector<vector<int>> memoriaTabu(n, vector<int>(n, 0)); // Almacena "iteración de desbloqueo"
    
    int maxReinicio = 8 * n; // Reinicio tras estancamiento ? No, "Cada 8n iteraciones reiniciar"
    int iteracionesTotales = 100 * n; // Limite global ejemplo
    
    for (int iter = 1; iter <= iteracionesTotales; iter++) {
        
        // 1. Examinar Entorno (40 vecinos aleatorios)
        long long mejorDeltaVecindario = 99999999999; // Infinito
        int moveR = -1;
        int moveS = -1;
        bool esTabu = false;
        
        for (int k = 0; k < 40; k++) {
            int r = aleatorio(0, n - 1);
            int s = aleatorio(0, n - 1);
            while (r == s) s = aleatorio(0, n - 1);
            
            long long delta = calcularDelta(r, s, actual, flujo, distancia);
            long long costeVecino = costeActual + delta;
            
            // Chequear Tabú
            // ¿Es (r, s) tabú? -> Comprobamos si memoriaTabu[r][s] > iter
            // Nota: Tabú suele prohibir asignar unidad U a loc L. Aquí simplificamos a prohibir Swap inverso reciente.
            bool tabu = (memoriaTabu[r][s] > iter);
            
            // Criterio de Aspiración: Si es tabú pero mejora el global, se permite
            if (tabu && costeVecino < costeMejorGlobal) {
                tabu = false; // Romper tabú
            }
            
            if (!tabu) {
                if (delta < mejorDeltaVecindario) {
                    mejorDeltaVecindario = delta;
                    moveR = r;
                    moveS = s;
                }
            }
        }
        
        // 2. Aplicar Movimiento
        if (moveR != -1) {
            swap(actual[moveR], actual[moveS]);
            costeActual += mejorDeltaVecindario;
            
            // Actualizar Tabú (Prohibir deshacer swap r,s durante tenencia)
            memoriaTabu[moveR][moveS] = iter + teneciaTabu;
            memoriaTabu[moveS][moveR] = iter + teneciaTabu;
            
            // Actualizar Global
            if (costeActual < costeMejorGlobal) {
                mejorGlobal = actual;
                costeMejorGlobal = costeActual;
            }
        }
        
        // 3. Reinicialización (Diversificación)
        // "Cada 8n iteraciones"
        if (iter % (8 * n) == 0) {
            // Estrategia: Aleatoria (25%), Mejor (25%), Constructiva (50%) - Simplificado a Aleatoria por ahora
             actual = generarSolucionAleatoria(n);
             costeActual = evaluarSolucion(actual, flujo, distancia);
             // Limpiar memoria tabu? Generalmente sí.
             fill(memoriaTabu.begin(), memoriaTabu.end(), vector<int>(n, 0));
        }
    }
    
    return {mejorGlobal, costeMejorGlobal};
}
