# SOP Maestro: Investigación Académica Automatizada y Verificada con IA

Este documento (Standard Operating Procedure) establece el protocolo riguroso, paso a paso, para la investigación, redacción y verificación de artículos académicos utilizando Inteligencia Artificial. Su objetivo es garantizar la máxima eficiencia productiva eliminando por completo el riesgo de "alucinaciones" y sesgos no verificados.

---

## 🏗️ 1. Arquitectura y Stack Tecnológico

No uses ChatGPT para buscar información en internet. La IA generativa (LLMs) se usa como **Motor de Lógica**, mientras que las herramientas especializadas actúan como **Motor de Búsqueda y Datos Reales**.

### El Stack Obligatorio
1. **Motores de Descubrimiento (Búsqueda Real):** 
   - **Elicit / Consensus / Undermind:** Para extraer literatura real. Devuelven listas priorizadas, abstracts y metadatos exportables a formatos `.bib` o `.csv`.
2. **Motores de Verificación (Anti-Alucinaciones):**
   - **Scite.ai:** Imprescindible para verificar si una afirmación ha sido respaldada o refutada por investigaciones posteriores (*Smart Citations*).
3. **Gestores de Referencias (El Ancla):**
   - **Zotero / Mendeley:** Para almacenar y orquestar las citaciones exportadas de la Fase 1 en tu manuscrito.
4. **Motores de Síntesis y Lógica (Análisis Profundo):**
   - **Claude 3 Opus / Claude 3.5 Sonnet:** La opción recomendada por su inmensa ventana de contexto superior y capacidad analítica para leer múltiples papers de golpe sin degradar la retención.

---

## ⏱️ 2. Flujo de Trabajo Cronológico (Sprints de Ejecución)

### FASE 1: Diseño de la Búsqueda y Criba Rápida
**Objetivo:** Construir una base de datos de 20-30 papers fundamentales sin contaminación.

1. **Prompt de Criba Rápida (Claude / ChatGPT):** 
   * "Mi tema es [Tema]. Extrae 10-15 palabras clave precisas y genera 3 secuencias booleanas (AND/OR) de alta precisión para buscar en bases científicas."
2. **Extracción Especializada (Elicit / Consensus):** 
   * Ejecuta el booleano generado en la herramienta.
   * Filtra por publicaciones de los últimos 5 años (Q1/Q2).
   * Descarga el archivo de referenciación `.csv` con los datos en bruto (título, abstract, autores, DOI).

### FASE 2: Ingeniería del "Gap" y Marco Teórico
**Objetivo:** Encontrar el hueco real en la literatura y fundamentar tu propuesta usando la matriz de datos.

1. **Prompt de Análisis Sistemático (Claude + `.csv` pegado):** 
   * Pega tu lista de referencias en Claude.
   * *Instrucción:* "Actúa como investigador senior. Analiza esta lista de papers reales. Haz un mapa temático, analiza convergencias y divergencias, e identifica brechas (gaps) publicables y factibles."
2. **Derivación del *Elevator Pitch*:**
   * Pide a la IA que sintetice el gap elegido en 200 palabras (Problema → Justificación → Propuesta).
3. **Prompt del Marco Teórico:**
   * Pide a la IA mapear teorías candidatas que encajen en el gap y generar una tabla comparativa, asegurando que cruce los datos de los papers extraídos.

### FASE 3: Despiece Metodológico y Estructura de Datos
**Objetivo:** Deconstruir textos metodológicos densos y tabular resultados.

1. **Extracción Profunda e Individual:** 
   * Al leer un paper de alta complejidad técnica: "Paso a paso, explícame esta formulación/metodología para que pueda replicar el experimento sin ambigüedades. Texto: [Pegar]."
2. **Armado de Tablas y Gráficos:**
   * "Convierte estos datos de resultados crudos en una tabla Markdown estructurada y sugiereme el gráfico óptimo para enviar a una revista Q1."

### FASE 4: Redacción, Estilo y Verificación
**Objetivo:** Refinar el borrador crudo y empaquetar comercialmente ("Clickbait Académico").

1. **El Proofreader Autoritario (Corrección Iterativa):** 
   * Escribe rápido y crudo. Luego, pasa fragmentos de 500 palabras: "Actúa como editor senior de revista Scopus Q1. Diagnostica este texto evaluando: claridad, precisión, modo y cohesión. Haz una tabla de errores, y luego reescribe."
2. **Empaque Final:**
   * **Abstract Estructurado:** Problema, Objetivo, Métodos, Resultados, Conclusión.
   * **Títulos Atractivos:** "Genera 5 opciones de título académico pero con un gancho (hook) estructural para maximizar citaciones."
3. **Punto de Control Obligatorio:** Pasa tus afirmaciones clave por **Scite.ai** para confirmar que no estás apoyando tu tesis en un paper que ya ha sido masivamente refutado.

### FASE 5: Control de Calidad Simulado (El Referí Implacable)
**Objetivo:** Anticipar el rechazo del tribunal o la revista.

* **Prompt Peer-Review:** "Actúa como el Revisor 2 (implacable pero constructivo) de [Nombre de Revista]. Escribe un referato realista basado en este manuscrito cerrado. Necesito: Decisión Editorial justificada, 3 errores mayores, errores menores y 3 preguntas metodológicas muy desafiantes."

---

## 🔒 3. Protocolo Estricto de Verificación (Reglas de Oro)
Para asegurar el **rigor procedimental**:
1. **El contexto lo pones TÚ:** Nunca pidas a una IA general que resuma "qué se sabe de X". Oblígala a leer los textos o abstracts que TÚ sacaste de Elicit/Consensus.
2. **Cero delegación de referencias:** La IA *ayuda a escribir* basándose en la literatura, pero las citas intra-texto introducidas (ej. `(Smith, 2023)`) deben estar ancladas en tu biblioteca de **Zotero/Mendeley**.
3. **Prueba Inversa (Reverse Prompts):** Si la IA te genera una propuesta metodológica muy innovadora, aplícale un test de estrés: *"Actúa ahora como un crítico de esta metodología que acabas de proponer. ¿Cuáles son sus tres mayores debilidades estadisticas o lógicas?"*
