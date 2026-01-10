# Auditoría de Limitaciones Técnicas: Navier-Stokes WebGPU

Este documento detalla los compromisos técnicos y las brechas de fidelidad identificadas en la implementación actual del proyecto "Million Visual Challenges", contrastándolas con los estándares de investigación industrial (e.g., Google DeepMind, Caltech).

## 1. Precisión Numérica e Inestabilidad de Punto Flotante
*   **Estado Actual**: Uso exclusivo de `f32` (32-bit floating point) en WebGPU.
*   **Limitación**: Las singularidades de tipo II son extremadamente sensibles. Errores de redondeo de $10^{-7}$ actúan como ruido físico que destruye la singularidad.
*   **Estrategias de Mitigación**:
    1.  **Emulación Double-Single**: Implementar shaders `float64` emulados (pares `f32`) para alcanzar ~46 bits de mantisa.
    2.  **Sistema Numérico Jerárquico (HNS)**: Uso de canales RGBA para distribuir representaciones numéricas de alta precisión.
    3.  **Normalización de Gradientes**: Aplicar la pérdida ponderada por la magnitud del gradiente local (Wang et al. 2025) para reducir la dependencia de la precisión bruta.

## 2. Escalabilidad y Densidad de Partículas
*   **Estado Actual**: $\approx 50,000$ partículas en grid de $64^3$.
*   **Limitación**: Insuficiente para capturar la cascada hacia la escala de Kolmogorov.
*   **Estrategias de Mitigación**:
    1.  **Optimización MLS-MPM**: Migrar a un diseño **Structure of Arrays (SoA)** para maximizar la coherencia de caché en la GPU.
    2.  **Grillas Dispersas (Sparse Grids)**: Implementar **DT-Grid** o estructuras tipo VDB para asignar cómputo solo en la "banda estrecha" de interés, permitiendo dominios virtualmente infinitos.

## 3. Arquitectura Dual-Resolution (Justificación Formal)
Para el cierre del proyecto, se establece una distinción consciente entre dos capas:
1.  **Motor Ground Truth (Offline/Python)**: Utiliza `float64` y PINNs profundas para descubrir y validar la singularidad matemáticamente. Aquí reside la "Verdad Científica".
2.  **Motor Visual (Online/WebGPU)**: Utiliza `f32`, MLS-MPM y SSFR para comunicar y explorar interactivamente esa verdad en tiempo real.

**Conclusión**: Aunque la visualización opera en `f32`, la estructura mostrada se deriva de un modelo offline de alta fidelidad. La plataforma web actúa como un visor interactivo de soluciones validadas, cerrando la brecha cognitiva entre la teoría abstracta y la percepción física.
