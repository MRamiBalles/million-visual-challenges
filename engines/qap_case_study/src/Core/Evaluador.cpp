#include <vector>
#include <iostream>

using namespace std;

// Métrica global de esfuerzo
long long numEvaluaciones = 0;

void resetEvaluaciones() {
    numEvaluaciones = 0;
}

// Evaluador de Coste para QAP
// Coste = Sum(F[i][j] * D[S[i]][S[j]])
long long evaluarSolucion(const vector<int>& solucion, const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    numEvaluaciones++;
    long long coste = 0;
    size_t n = solucion.size();
    
    for (size_t i = 0; i < n; i++) {
        for (size_t j = 0; j < n; j++) {
            if (i != j) {
                coste += flujo[i][j] * distancia[solucion[i]][solucion[j]];
            }
        }
    }
    return coste;
}

// Cálculo eficiente del Delta (Diferencia de coste al intercambiar r y s)
// Complejidad O(n) en vez de O(n^2)
long long calcularDelta(int r, int s, const vector<int>& solucion, const vector<vector<int>>& flujo, const vector<vector<int>>& distancia) {
    // Delta también cuenta como evaluación parcial (esfuerzo computacional)
    // numEvaluaciones++; // Descomentar si se quiere contar deltas. Para QAP, el Delta es O(n) y evaluar es O(n^2).
    // Usualmente para comparación justa se cuenta 1 eval completa = N deltas? 
    // Por simplicidad y siguiendo prácticas habituales donde Delta es la operación atómica de BL:
    numEvaluaciones++; 

    long long delta = 0;
    size_t n = solucion.size();
    
    // Unidades r y s
    int u_r = solucion[r];
    int u_s = solucion[s];
    
    for (size_t k = 0; k < n; k++) {
        if (k != r && k != s) {
            int u_k = solucion[k];
            // Restar contribución antigua
            delta -= (flujo[r][k] * distancia[u_r][u_k] + flujo[k][r] * distancia[u_k][u_r] +
                      flujo[s][k] * distancia[u_s][u_k] + flujo[k][s] * distancia[u_k][u_s]);
            
            // Sumar contribución nueva
            delta += (flujo[r][k] * distancia[u_s][u_k] + flujo[k][r] * distancia[u_k][u_s] +
                      flujo[s][k] * distancia[u_r][u_k] + flujo[k][s] * distancia[u_k][u_r]);
        }
    }
    
    // Add interaction between r and s
    delta -= (flujo[r][s] * distancia[u_r][u_s] + flujo[s][r] * distancia[u_s][u_r]);
    delta += (flujo[r][s] * distancia[u_s][u_r] + flujo[s][r] * distancia[u_r][u_s]);
    
    return delta;
}
