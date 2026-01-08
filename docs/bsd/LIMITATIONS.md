# Limitaciones de Pureza y Singularidades (v2.1)

Los algoritmos de verificación estándar en este laboratorio asumen **pureza cohomológica**, la cual falla para modelos de Weierstrass singulares en característica mixta (mala reducción).

## Desafíos de Rigor Académico

### 1. Falla de Pureza en Fibras Singulares
En los primos de mala reducción (e.g., el divisor del discriminante $\Delta$), el modelo de la curva no es liso. La correspondencia entre el lado analítico y el motívico se degrada debido a la falta de un isomorfismo de comparación canónico.

### 2. Solución Teórica: Morfismos de Períodos Extendidos
Según **Guo y Yang (2025)**, la recuperación de la información aritmética en estos casos requiere extender el mapeo de períodos a través del locus discriminante.
- **Técnica**: Alineación motívica mediante ciclos de vanishing.
- **Estado en MVC**: El código actual no implementa la resolución de estas singularidades locales. Las discrepancias en curvas como `496a1` deben interpretarse bajo esta limitación de pureza local.

### 3. Mapa de Abel-Jacobi p-ádico
La construcción de puntos racionales desde ceros de funciones L (Mapa de Realización) requiere el uso de la teoría de **BDP (Bertolini-Darmon-Prasanna)**, la cual conecta ciclos diagonales con derivados de funciones L. Nuestra visualización UESDF es una condición necesaria pero no suficiente para la construcción física de las coordenadas $(x, y)$.
