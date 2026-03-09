#include <iostream>
#include <fstream>
#include <vector>
#include <string>

using namespace std;

struct QAPInstance {
    int n;
    vector<vector<int>> flujo;
    vector<vector<int>> distancia;
};

QAPInstance leerInstancia(const string& ruta) {
    ifstream archivo(ruta);
    QAPInstance instancia;
    
    if (!archivo.is_open()) {
        cerr << "Error: No se pudo abrir el archivo " << ruta << endl;
        instancia.n = 0;
        return instancia;
    }
    
    archivo >> instancia.n;
    
    instancia.flujo.resize(instancia.n, vector<int>(instancia.n));
    instancia.distancia.resize(instancia.n, vector<int>(instancia.n));
    
    // Leer Matriz de Flujo
    for (int i = 0; i < instancia.n; i++) {
        for (int j = 0; j < instancia.n; j++) {
            archivo >> instancia.flujo[i][j];
        }
    }
    
    // Leer Matriz de Distancia
    for (int i = 0; i < instancia.n; i++) {
        for (int j = 0; j < instancia.n; j++) {
            archivo >> instancia.distancia[i][j];
        }
    }
    
    archivo.close();
    return instancia;
}
