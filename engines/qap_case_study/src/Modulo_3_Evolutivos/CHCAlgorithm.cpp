#include <vector>
#include <iostream>
#include <algorithm>
#include <fstream>

// Dependencias de otros módulos (Unity Build friendly)
// Asumimos que Generador, Evaluador, Diversity y Mutation ya están incluidos o se incluirán en el main.
// Sin embargo, para que este archivo sea autocontenido si se compila solo (o con un main simple), 
// podríamos necesitar guards. En este proyecto, el usuario gestiona los includes en el main.
// Para claridad, declaro lo que uso externamente.

// External Functions needed:
// int distanciaHamming(const vector<int>& a, const vector<int>& b);
// void mutarSublista(vector<int>& sol, int s);
// void cruceOX(const vector<int>& p1, const vector<int>& p2, vector<int>& h1, vector<int>& h2);
// vector<int> generarSolucionAleatoria(int n);
// long long evaluarSolucion(...);
// inicializarSemilla(...);

using namespace std;

// Estructura Individuo (Local para evitar colisiones si no hay header común)
struct IndividuoCHC {
    vector<int> genotipo;
    long long fitness;
    
    bool operator<(const IndividuoCHC& otro) const {
        return fitness < otro.fitness;
    }
};

struct ConfigCHC {
    int poblacionSize = 50; 
    int maxEvaluaciones = 50000; // Parada por evaluaciones (estándar en CHC para comparar esfuerzo)
};

struct ResultadoCHC {
    vector<int> mejorSolucion;
    long long mejorCoste;
};

// Función de Cataclismo (Diverge)
// Mantiene al mejor (elite), y rellena resto con copias mutadas al 35%
void cataclismo(vector<IndividuoCHC>& poblacion, int n) {
    // Asumimos poblacion ordenada, index 0 es el mejor
    IndividuoCHC mejor = poblacion[0];
    
    // Tamaño de mutación fuerte (35%)
    int s = max(2, (int)(n * 0.35));
    
    for (size_t i = 1; i < poblacion.size(); i++) {
        poblacion[i] = mejor; // Copiar mejor
        mutarSublista(poblacion[i].genotipo, s); // Mutar fuertemente
        // Nota: El fitness queda invalidado, hay que reevaluar? 
        // Sí, pero el Evaluador requeriría pasar Flujo/Distancia. 
        // Lo haremos en el bucle principal o pasamos referencias aquí.
        // Por diseño, marcaremos fitness como -1 y reevaluaremos fuera.
        poblacion[i].fitness = -1; 
    }
}

// Comparador para ordenar punteros o referencias si fuera necesario
// Aquí ordenamos vector de objetos directamente.

ResultadoCHC algoritmoCHC(const vector<vector<int>>& flujo, const vector<vector<int>>& distancia, ConfigCHC config, string logFile = "") {
    int n = flujo.size();
    ofstream log;
    if (logFile != "") {
        log.open(logFile);
        log << "Eval,MejorCoste,Umbral_d,EsCataclismo\n";
    }
    
    // 1. Inicialización
    vector<IndividuoCHC> poblacion(config.poblacionSize);
    for(int i=0; i<config.poblacionSize; i++) {
        poblacion[i].genotipo = generarSolucionAleatoria(n);
        poblacion[i].fitness = evaluarSolucion(poblacion[i].genotipo, flujo, distancia);
    }
    sort(poblacion.begin(), poblacion.end()); // Mejor en 0
    
    IndividuoCHC mejorGlobal = poblacion[0];
    
    // Configuración Inicial CHC
    int d = n / 4; // Umbral de incesto inicial (L/4)
    int evalCounter = config.poblacionSize; // Contamos las iniciales
    
    while (evalCounter < config.maxEvaluaciones) {
        
        // --- 1. Selección y Cruce (Incesto) ---
        vector<IndividuoCHC> hijos;
        hijos.reserve(config.poblacionSize);
        
        // Barajar población para emparejamiento aleatorio
        // Copiamos índices para no perder el orden de la población principal (necesario para elitismo luego?)
        // No, en CHC seleccionamos de (P + Hijos), así que el orden de P no importa tanto al generar hijos,
        // pero sí necesitamos P intacta para la union.
        vector<int> indices(config.poblacionSize);
        for(int i=0; i<config.poblacionSize; i++) indices[i] = i;
        shuffle(indices.begin(), indices.end(), rng);
        
        for(int i = 0; i < config.poblacionSize; i += 2) {
            if (i+1 >= config.poblacionSize) break;
            
            IndividuoCHC& p1 = poblacion[indices[i]];
            IndividuoCHC& p2 = poblacion[indices[i+1]];
            
            // Check Incesto
            if (distanciaHamming(p1.genotipo, p2.genotipo) > d) {
                IndividuoCHC h1, h2;
                // Cruce OX
                cruceOX(p1.genotipo, p2.genotipo, h1.genotipo, h2.genotipo);
                
                // Evaluar (Sin mutación)
                h1.fitness = evaluarSolucion(h1.genotipo, flujo, distancia);
                h2.fitness = evaluarSolucion(h2.genotipo, flujo, distancia);
                evalCounter += 2;
                
                hijos.push_back(h1);
                hijos.push_back(h2);
            }
        }
        
        // --- 2. Control del Umbral y Supervivencia ---
        if (hijos.empty()) {
            d--; // Reducir umbral si nadie se cruza
        } else {
            // Elitismo: Unir P + Hijos y elegir N mejores
            // Estrategia eficiente: Sort hijos, merge? O simplemente meter todo en un vector y sort.
            vector<IndividuoCHC> pool = poblacion;
            pool.insert(pool.end(), hijos.begin(), hijos.end());
            
            sort(pool.begin(), pool.end()); // Ordena por fitness ascendente
            
            // Sobrescribir población con los N mejores
            for(int i=0; i<config.poblacionSize; i++) {
                poblacion[i] = pool[i];
            }
            
            // Actualizar Global
            if (poblacion[0].fitness < mejorGlobal.fitness) {
                mejorGlobal = poblacion[0];
            }
        }
        
        // Logging
        if (logFile != "") {
            // Marcamos cataclismo en el log next step si d < 0
            bool cataclismoNext = (d < 0);
            log << evalCounter << "," << mejorGlobal.fitness << "," << d << "," << (cataclismoNext ? 1 : 0) << "\n";
        }
        
        // --- 3. Cataclismo ---
        if (d < 0) {
            // Diverge: La población ha convergido. Reiniciar manteniendo el mejor.
            cataclismo(poblacion, n); // Muta todos menos el mejor
            
            // Reevaluar los mutados
            for(size_t i=1; i<poblacion.size(); i++) {
                poblacion[i].fitness = evaluarSolucion(poblacion[i].genotipo, flujo, distancia);
                evalCounter++;
            }
            
            // Resetear umbral
            d = n / 4;
        }
    }
    
    if (logFile != "") log.close();
    return {mejorGlobal.genotipo, mejorGlobal.fitness};
}
