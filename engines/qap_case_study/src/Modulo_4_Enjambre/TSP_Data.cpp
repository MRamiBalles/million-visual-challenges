#include <vector>
#include <string>
#include <fstream>
#include <cmath>
#include <iostream>
#include <sstream>

using namespace std;

struct Ciudad {
    int id;
    double x;
    double y;
};

struct TSPInstance {
    int n;
    vector<Ciudad> ciudades;
};

// Distancia Euclídea redondeada a entero (Estandar TSPLIB)
int distanciaEuc(const Ciudad& c1, const Ciudad& c2) {
    double dx = c1.x - c2.x;
    double dy = c1.y - c2.y;
    return (int)(round(sqrt(dx*dx + dy*dy)));
}

// Parser básico para formato TSPLIB (NODE_COORD_SECTION)
TSPInstance leerTSP(string ruta) {
    TSPInstance inst;
    ifstream archivo(ruta);
    string linea;
    bool leyendoCoords = false;
    
    // Si no abre, retornamos vacía
    if (!archivo.is_open()) {
        inst.n = 0;
        return inst; 
    }

    while (getline(archivo, linea)) {
        if (linea.find("DIMENSION") != string::npos) {
            // Extraer N
            size_t pos = linea.find(":");
            inst.n = stoi(linea.substr(pos + 1));
            inst.ciudades.reserve(inst.n);
        }
        else if (linea.find("NODE_COORD_SECTION") != string::npos) {
            leyendoCoords = true;
            continue;
        }
        else if (linea.find("EOF") != string::npos) {
            break;
        }
        else if (leyendoCoords) {
            stringstream ss(linea);
            int id; 
            double x, y;
            if (ss >> id >> x >> y) {
                inst.ciudades.push_back({id, x, y});
            }
        }
    }
    return inst;
}
