# MBHB: Modelos Bioinspirados y Heurísticas de Búsqueda
**Framework de Optimización C++ (Curso 2026)**

Este repositorio contiene la implementación completa de las prácticas de la asignatura, cubriendo desde heurísticas de trayectoria simples hasta inteligencia de enjambre y algoritmos evolutivos avanzados.

## 🚀 Instrucciones de Compilación (Globales)

El proyecto está diseñado para compilarse en Módulos Independientes ("Unity Build" simplificado para cada práctica). Se recomienda usar el flag de optimización `-O3`.

### Práctica 1: Trayectorias (Greedy, LS, SA, Tabu)
Comparativa de algoritmos de trayectoria simple sobre QAP.
```bash
g++ -O3 -o bin/practica1.exe main_practica1.cpp
```

### Práctica 2a: Multiarranque (GRASP, ILS, VNS)
Algoritmos de búsqueda iterada y entornos variables sobre QAP.
```bash
g++ -O3 -o bin/practica2a.exe main_practica2.cpp
```

### Práctica 2b: Evolutivos (AGG, CHC)
Algoritmos poblacionales. Incluye validación AGG inicial y sistema CHC completo.
```bash
# Validación AGG
g++ -O3 -o bin/test_agg.exe main_test_AGG.cpp
# Benchmark CHC
g++ -O3 -o bin/test_chc.exe main_test_CHC.cpp
```

### AAD: Inteligencia de Enjambre (PSO, ACO)
Módulos específicos para optimización continua (PSO) y TSP (ACO).
```bash
# PSO (Rastrigin)
g++ -O3 -o bin/test_pso.exe main_test_PSO.cpp
# ACO (TSP ch130)
g++ -O3 -o bin/test_aco.exe main_test_ACO.cpp
```

---

## 🗺️ Mapa del Proyecto

### 📁 Estructura de Directorios
*   `Core/`: Utilidades comunes (Generador aleatorio, Evaluador QAP, Parser).
*   `Modulo_1_Trayectorias/`: Greedy, RandomSearch, LocalSearch, SA, Tabu.
*   `Modulo_2_Multiarranque/`: GRASP, ILS, VNS, Diversity (Hamming), Mutation (Sublista).
*   `Modulo_3_Evolutivos/`: AGG (GeneticAlgorithm), CHCAlgorithm, Crossover (OX).
*   `Modulo_4_Enjambre/`: PSO (Partículas), ACO (Hormigas, Grafos, TSP Parser).

### 📋 Detalle de Algoritmos Implementados

| Módulo | Algoritmo | Variante / Características Clave | Params Clave |
| :--- | :--- | :--- | :--- |
| **P1** | **Greedy** | Constructivo determinista por Flujo/Distancia | N/A |
| **P1** | **Local Search** | First Improvement (Randomized Neighbors) | - |
| **P1** | **Simulated Annealing** | Enfriamiento Cauchy ($T_k = T_0/(1+k)$) | $T_0$ dinámico |
| **P1** | **Tabu Search** | Lista circular, Diversificación por reinicio | Tenencia Tabú |
| **P2a** | **GRASP** | Construcción Greedy Aleatorizada (LRC) + BL | $\alpha=0.1$ |
| **P2a** | **ILS** | Iterated Local Search, Perturbación Fija | $s=n/4$, 10 iter |
| **P2a** | **VNS** | Variable Neighborhood Search | $k=1..5$ ($s$ var) |
| **P2b** | **AGG** | Genético Generacional, Elitismo | Torneo $k=10\%$, OX $P_c=0.9$ |
| **P2b** | **CHC** | Cross-Generational Elitist Selection | Incesto (Hamming), Cataclismo |
| **AAD** | **PSO** | Topología de Anillo (Vecindad 2) | $W=0.7, C_{1,2}=1.5$ |
| **AAD** | **ACO** | Sistema de Hormigas (SH) y Elitista (SHE) | $\alpha=2, \beta=2, \rho=0.15$ |

---

## ⚙️ Notas de Configuración

1.  **Datasets QAP:** El código espera encontrar los archivos `Tai25b.dat`, `Sko90.dat`, `Tai150b.dat` en el directorio de ejecución o rutas relativas configuradas.
2.  **Dataset TSP:** Para ACO, se requiere `ch130.tsp`. Si no se encuentra, el test genera un dummy circular para validación técnica.
3.  **Semillas:** Los scripts de prueba (`test_*.bat`) utilizan semillas fijas (123456, etc.) para reproducibilidad. Para producción, modificar `inicializarSemilla()` con `time(NULL)` o similar.
4.  **Tiempos de Ejecución:**
    *   **ACO:** Configurado estrictamente a 180 segundos (3 minutos) por ejecución.
    *   **Local Search:** Puede ser intensivo en instancias grandes ($N=150$).

## 📊 Generación de Reportes
Cada ejecutable principal genera archivos `.csv` con logs detallados (convergencia, diversidad, etc.) listos para ser importados en Python/Excel para las gráficas de las memorias.

---
*Generado automáticamente por Asistente de Desarrollo MBHB - 2026*
