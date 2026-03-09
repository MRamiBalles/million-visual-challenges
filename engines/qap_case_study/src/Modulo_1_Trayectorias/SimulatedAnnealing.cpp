#include <vector>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;

// Parametros para T0: mu=phi=0.3
const double MU = 0.3;
const double PHI = 0.3;

// --- Enfriamiento Simulado (Simulated Annealing) ---
struct ResultadoSA {
    vector<int> solucion;
    long long coste;
};

// Cálculo de Temperatura Inicial T0 según fórmula: T0 = (mu / -ln(phi)) * Coste_Inicial
double calcularT0(long long costeInicial) {
    return (MU / -log(PHI)) * costeInicial;
}

// Esquema de Cauchy: Tk = T0 / (1 + k)
double esquemaCauchy(double T0, int k) {
    return T0 / (1.0 + k);
}

ResultadoSA simulatedAnnealing(vector<int> solInicial, const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    int n = solInicial.size();
    
    // 1. Estado Actual y Mejor Global
    vector<int> actual = solInicial;
    long long costeActual = evaluarSolucion(actual, flujo, distancia);
    
    vector<int> mejor = actual;
    long long costeMejor = costeActual;
    
    // 2. Inicialización
    double T = calcularT0(costeActual);
    double T0 = T;
    
    int maxEnfriamientos = 50 * n; // M = 50n
    int longitudCadenaMarkov = 50 * n; // L = 50n (Ojo: Documentación dice "hasta generar 40 vecinos o 5 éxitos", revisar)
                                       // Ajuste según USER: "Iteras hasta generar 40 vecinos o aceptar 5 mejoras"
    
    // Bucle de Enfriamiento
    for (int k = 0; k < maxEnfriamientos; k++) {
        
        int vecinosGenerados = 0;
        int exitos = 0;
        
        // Cadena de Markov (Nivel de Temperatura constante)
        while (vecinosGenerados < 40 && exitos < 5) { // Condición específica reportada por USER
            vecinosGenerados++;
            
            // Generar vecino aleatorio (Swap r, s)
            int r = aleatorio(0, n - 1);
            int s = aleatorio(0, n - 1);
            while (r == s) s = aleatorio(0, n - 1);
            
            long long delta = calcularDelta(r, s, actual, flujo, distancia);
            
            // Criterio de Aceptación Metropolis
            // Si delta < 0 (mejora), exp > 1 -> Acepta siempre
            // Si delta > 0 (empeora), probabilidad e^(-delta/T)
            if (delta < 0 || aleatorioUniforme() < exp(-delta / T)) {
                // Aceptamos
                swap(actual[r], actual[s]);
                costeActual += delta;
                exitos++;
                
                // Actualizar Mejor Global
                if (costeActual < costeMejor) {
                    mejor = actual;
                    costeMejor = costeActual;
                }
            }
        }
        
        // Enfriar (Cauchy)
        T = esquemaCauchy(T0, k + 1);
        
        // Parada anticipada si T es muy baja (opcional, pero Cauchy baja lento)
        if (T < 0.001) break; 
    }
    
    return {mejor, costeMejor};
}
