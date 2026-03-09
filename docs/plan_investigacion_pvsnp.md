# Planificación de Investigación Estratégica: P vs NP (Modelo Multi-Obstrucción)

Siguiendo el SOP (*sop_investigacion_automatizada.md*), este documento planifica la **Fase 1 (Descubrimiento y Criba)** para profesionalizar y fundamentar teóricamente las cuatro obstrucciones ("Gaps") identificadas en tu investigación sobre $\mathsf{P} \neq \mathsf{NP}$ (`P_neq_NP_Research.tex`).

El objetivo es generar las **Ecuaciones de Búsqueda Booleanas** exactas que debes introducir en motores científicos cerrados (Elicit / Consensus) para extraer los `.csv` con literatura real (papers del Q1/Q2, últimos 5 años), evitando alucinaciones y sesgos.

---

## 🧭 Estructura del Plan de Consultas

Tu propuesta en `P_neq_NP_Research.tex` se divide en 4 pilares ("obstrucciones"). He diseñado las consultas para atacar cada pilar independientemente y cruzar la computación con la física/topología.

### 1. Obstrucción Topológica (Homología Simplicial en NP)
**Objetivo:** Fundamentar matemáticamente que el espacio de configuración de un problema NP-completo (como SAT) posee agujeros topológicos (ciclos $H_1 \neq 0$), a diferencia de $\mathsf{P}$.
*   **Conceptos Clave:** Topological data analysis (TDA), simplicial homology, configuration spaces, computational complexity, NP-hardness.
*   **Ecuación de Búsqueda Booleana (Scopus/Web of Science/Elicit):**
    ```text
    ("topological data analysis" OR "simplicial homology" OR "Betti numbers") AND ("computational complexity" OR "NP-hard" OR "configuration space") AND ("boolean satisfiability" OR "SAT")
    ```
*   **Filtro:** 2020-2026. Priorizar papers teóricos y aplicaciones de TDA en ciencias de la computación.

### 2. Obstrucción Algebraica (Geometric Complexity Theory - GCT)
**Objetivo:** Consolidar empíricamente tu hallazgo sobre el colapso del coeficiente de Kronecker ($k=5$) y la divergencia entre multiplicidad en Permanente vs. Determinante.
*   **Conceptos Clave:** Geometric Complexity Theory, Kronecker coefficients, plethysm, algebraic complexity, permanent vs determinant.
*   **Ecuación de Búsqueda Booleana:**
    ```text
    ("Geometric Complexity Theory" OR "Mulmuley") AND ("Kronecker coefficients" OR "plethysm" OR "representation theory") AND ("algebraic complexity" OR "permanent determinant problem")
    ```
*   **Filtro:** 2018-2026. (Este campo es un nicho matemático puro, ampliar a 2018 es útil).

### 3. Obstrucción Física (Caos Transitorio y Termodinámica)
**Objetivo:** Validar la hipótesis termodinámica de que algoritmos sobre instancias NP-Hard (ej. LagONN) sufren de caos transitorio (exponencialidad de Lyapunov) y "Wada basins" cerca del umbral de fase.
*   **Conceptos Clave:** Transient chaos, Lyapunov exponents, phase transition, NP-complete, simulated annealing, Wada basins, thermodynamic limit.
*   **Ecuación de Búsqueda Booleana:**
    ```text
    ("transient chaos" OR "Lyapunov exponent" OR "Wada basin") AND ("phase transition" OR "combinatorial optimization") AND ("NP-hard" OR "NP-complete" OR "spin glass")
    ```
*   **Filtro:** 2020-2026. Incluir journals de física estadística (Ej. *Physical Review E*, *Journal of Statistical Mechanics*).

### 4. Obstrucción Termodinámica / Relativista (Log-Spacetime)
**Objetivo:** Buscar literatura emergente que modele algoritmos computacionales embebidos en métricas espaciotemporales o utilizando límites causales relativistas (causal horizons, holographic bounds).
*   **Conceptos Clave:** Holographic complexity, causal horizon, spacetime metrics in computing, logarithmic time, quantum circuit complexity.
*   **Ecuación de Búsqueda Booleana:**
    ```text
    ("holographic complexity" OR "computational complexity") AND ("causal horizon" OR "light cone" OR "AdS/CFT") AND ("spacetime metric" OR "quantum circuit")
    ```
*   **Filtro:** 2021-2026. (Campo en altísima ebullición gracias a Susskind y gravitación cuántica).

---

## 🛠️ Instrucciones de Ejecución para el Usuario (SOP Fase 1)

**Paso 1: Ejecución Manual en IA Especializada**
1. Copia exactamente las Ecuaciones de Búsqueda de arriba.
2. Abre **Elicit.com** o **Consensus.app** (o ingresa a la biblioteca de tu institución si usas Scopus/WoS).
3. Pega la ecuación y filtra por años (2020-2026).
4. Selecciona los 10-15 artículos más relevantes por cita e impacto para cada una de las 4 obstrucciones.
5. Exporta los resultados como archivo `.csv` o `.bib`. **Generarás 4 archivos `.csv` en total.**

**Paso 2: Retorno a la IA de Lógica (Claude/ChatGPT)**
Cuando tengas los resúmenes exportados, vuelve a mí y ejecutaremos la **Fase 2 del SOP**. Me pegarás el contenido de esos `.csv` (uno por uno) utilizando este prompt:

> *"Actúa como investigador senior en Ciencias de la Computación y Física Teórica. Te paso una lista de papers reales exportados sobre la Obstrucción [Topológica/Algebraica/Física/Relativista] de P vs NP. A partir de EXCLUSIVAMENTE estos textos, haz un mapa temático e identifica brechas (gaps) que sostengan mi hipótesis documentada en `P_neq_NP_Research.tex`. Datos: [PEGA EL CSV AQUÍ]"*

---

> [!WARNING]
> **Rigor Científico:** Nunca introduciremos estas consultas de teoría de complejidad algorítmica y homología directamente en modelos de lenguaje general sin el anclaje de un archivo CSV real. La tentación de que la IA invente un paper sobre el "Coeficiente de Kronecker $k=5$" es altísima dada la escasez de literatura que combina ambas disciplinas.
