#include <vector>
#include <cmath>
#include <set>
#include <iostream>
// Asume ACO_Graph incluido o disponible
// Asume Generador.cpp (aleatorioUniforme)

using namespace std;

struct SolucionTSP {
    vector<int> camino; // Secuencia de ciudades
    long long coste;
};

class Hormiga {
public:
    int n;
    vector<bool> visitado;
    SolucionTSP tour;
    
    Hormiga(int numCiudades) : n(numCiudades) {
        visitado.resize(n);
        reset();
    }
    
    void reset() {
        fill(visitado.begin(), visitado.end(), false);
        tour.camino.clear();
        tour.camino.reserve(n);
        tour.coste = 0;
    }
    
    void construirTour(const ACOGraph& grafo) {
        // 1. Ciudad inicial aleatoria
        int actual = aleatorio(0, n - 1);
        marcar(actual);
        
        // 2. Construir nodos restantes
        for(int step = 1; step < n; step++) {
            int siguiente = seleccionarSiguiente(actual, grafo);
            
            // Sumar coste
            tour.coste += grafo.distancias[actual][siguiente];
            
            // Moverse
            marcar(siguiente);
            actual = siguiente;
        }
        
        // 3. Cerrar ciclo (volver a inicio)
        int inicio = tour.camino[0];
        tour.coste += grafo.distancias[actual][inicio];
    }
    
private:
    void marcar(int ciudad) {
        visitado[ciudad] = true;
        tour.camino.push_back(ciudad);
    }
    
    int seleccionarSiguiente(int actual, const ACOGraph& grafo) {
        // Regla Probabilística (Ruleta)
        // P_ij = [tau]^alpha * [eta]^beta / SUM(...)
        
        vector<int> candidatos; // Ciudades no visitadas
        vector<double> probs;
        double sumProb = 0.0;
        
        candidatos.reserve(n);
        probs.reserve(n);
        
        for(int i=0; i<n; i++) {
            if(!visitado[i]) {
                double tau = grafo.feromona[actual][i];
                double eta = grafo.visibilidad[actual][i];
                
                // Usamos pow lento? O optimizamos?
                // alpha=2, beta=2 -> (tau*tau)*(eta*eta) -> mucho mas rapido
                double p = (tau * tau) * (eta * eta); 
                
                candidatos.push_back(i);
                probs.push_back(p);
                sumProb += p;
            }
        }
        
        // Ruleta
        if (sumProb == 0) return candidatos[aleatorio(0, candidatos.size()-1)]; // Fallback raro
        
        double r = aleatorioUniforme() * sumProb;
        double acumulado = 0.0;
        for(size_t k=0; k<candidatos.size(); k++) {
            acumulado += probs[k];
            if (acumulado >= r) {
                return candidatos[k];
            }
        }
        
        return candidatos.back(); // Por error de redondeo
    }
};
