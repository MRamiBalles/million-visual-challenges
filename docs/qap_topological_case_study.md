# Caso de Estudio: QAP como Obstrucción Topográfica (Ejemplo Genérico Concreto)

Utilizando el repositorio `D:/AA/MBHB`, desglosamos el **Problema de Asignación Cuadrática (QAP)** bajo la óptica de nuestra investigación de P vs NP.

---

## 1. El Objeto: QAP (Quadratic Assignment Problem)
El QAP busca asignar $n$ unidades a $n$ locaciones minimizando:
$$Coste = \sum_{i,j}^n f_{i,j} \cdot d_{S[i], S[j]}$$
Topológicamente, el espacio de búsqueda es el **Permutaedro de orden $n$**.

## 2. P-Class: La Ilusión de la Contractibilidad (Greedy)
En `D:/AA/MBHB/Modulo_1_Trayectorias/Greedy.cpp`, el algoritmo ordena unidades por flujo y locaciones por centralidad.
- **Topología:** Es una **geodésica única**. Desde el estado vacío, cada decisión es determinista.
- **Vínculo Lean 4:** Este algoritmo cumple el axioma `P_deterministic_uniqueness`. Al no haber bifurcaciones ni backtracking, el grafo de estados es un **árbol**, y por tanto su homología es trivial ($H_1 = 0$).
- **Veredicto:** Es eficiente (P), pero "ciego" a la curvatura global del problema.

## 3. NP-Class: El Espacio con Agujeros (Búsqueda Local)
En `D:/AA/MBHB/Modulo_1_Trayectorias/LocalSearch.cpp`, nos movemos mediante *swaps* (intercambios).
- **El Gap:** El paisaje de costes (Fitness Landscape) del QAP es altamente rugoso.
- **Obstrucción de Čech (H1 != 0):** Los máximos locales son "pozos" de los que no se puede salir sin aumentar el coste. En términos de **Sheaf Theory**, una asignación local óptima (ej. unidad A en locación B) es inconsistente con el óptimo global. Esa inconsistencia es la "fase" que genera el agujero topológico detectado por nuestro `sheaf_scanner.py`.
- **Metaheurísticas (SA/Tabu):** Son intentos de "escalar" o "rodear" estos agujeros $H_1$ inyectando energía (Temperatura en SA) o memoria (Tabu) para romper los ciclos de estancamiento.

## 4. La Barrera Epistémica en MBHB
El archivo `D:/AA/MBHB/test_local_search.py` demuestra que, a medida que $n$ crece (ej. `Sko90.dat`), la probabilidad de que una trayectoria determinista encuentre el óptimo global tiende a cero.
- **Subjective Complexity:** Para un algoritmo Greedy, el QAP parece "simple" pero da resultados pobres. Para una Metaheurística, el problema es "complejo" (exige navegar ciclos), pero se acerca a la verdad (el óptimo global).

---

### 🚀 Conclusión del Ejemplo
El QAP de MBHB no es solo una práctica de programación; es la **manifestación física** de la separación P vs NP. 
- **P** es la línea recta que ignora la montaña.
- **NP** es la montaña llena de cuevas y ciclos que debemos mapear.

**Estado del Ejemplo:** `MAPPED & FORMALIZED` 🗺️
