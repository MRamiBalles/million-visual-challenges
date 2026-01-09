# Auditoría de Limitaciones Técnicas: Navier-Stokes WebGPU

Este documento detalla los compromisos técnicos y las brechas de fidelidad identificadas en la implementación actual del proyecto "Million Visual Challenges", contrastándolas con los estándares de investigación industrial (e.g., Google DeepMind, Caltech).

## 1. Precisión Numérica e Inestabilidad de Punto Flotante
*   **Estado Actual**: Uso exclusivo de `f32` (32-bit floating point) en WebGPU.
*   **Limitación**: Las singularidades de tipo II descubiertas por Wang et al. (2025) son extremadamente sensibles. Errores de redondeo de $10^{-7}$ pueden actuar como perturbaciones espurias significativas que "lavan" la estructura de la singularidad.
*   **Gap de Investigación**: Los papers de referencia utilizan aritmética de precisión arbitraria o `float64` con métodos de validación de intervalos (CAP) para asegurar que el "blow-up" no sea un artefacto numérico. La visualización actual es una *aproximación didáctica*, no una prueba matemática.

## 2. Escalabilidad y Densidad de Partículas
*   **Estado Actual**: $\approx 50,000$ partículas en un grid de $64^3$.
*   **Limitación**: La turbulencia y la formación de singularidades ocurren en escalas microscópicas. Para capturar la fase de colapso con rigor, se requerirían densidades de partículas órdenes de magnitud superiores (millones), lo que desbordaría la memoria VRAM y el ancho de banda de una GPU comercial estándar vía navegador.
*   **Gap de Investigación**: Los simuladores industriales utilizan clusters distribuidos con balanceo de carga dinámico, algo que la arquitectura actual de WebGPU (single-device) no puede emular sin una degradación masiva de FPS.

## 3. Integración de PINNs (Machine Learning)
*   **Estado Actual**: Inferencia de perfiles pre-calculados y entrenamiento base en Python.
*   **Limitación**: El motor PINN implementado es un prototipo. La convergencia real de un modelo para encontrar un parámetro de escala $\lambda \approx 0.4713$ requiere una sintonización de hiperparámetros masiva y el uso de **Gradient-Normalized Residuals** en niveles de profundidad que exceden lo implementado en los scripts locales.
*   **Gap de Investigación**: Google DeepMind utiliza pipelines de entrenamiento en JAX sobre miles de TPUs para alcanzar la precisión de máquina requerida para la publicación.

## 4. Estabilidad Numérica (Atomics)
*   **Estado Actual**: Actualización de grid simplificada sin operaciones atómicas para `f32`.
*   **Limitación**: El paso P2G (Particle-to-Grid) sufre de condiciones de carrera (race conditions) en regiones de alta densidad. Aunque el uso de APIC mitiga visualmente el ruido, existe una pérdida de rigor en la conservación de masa a nivel local.
*   **Gap de Investigación**: Las implementaciones profesionales utilizan *fixed-point atomics* o técnicas de *coloring* para garantizar determinismo absoluto byte-a-byte, algo omitido aquí para priorizar el rendimiento visual en el navegador.

## 5. Modelado Físico
*   **Estado Actual**: Modelo de estrés simplificado y condiciones de frontera de rebote básico.
*   **Limitación**: Se ignoran efectos de viscosidad variable y términos de presión de alto orden necesarios para modelar la frontera exacta entre el régimen laminar y el colapso singular.
*   **Gap de Investigación**: El uso de esquemas de orden superior (WENO, RK4) es el estándar en CFD (Computational Fluid Dynamics) de alta fidelidad, mientras que aquí se utiliza una integración de Euler simple o semi-implícita por restricciones de tiempo de ejecución.

---

### Diagnóstico para Contratación (Google/DeepMind Context)
Para alcanzar el nivel de "Hireable as Research Engineer", el proyecto debería evolucionar de una **Demostración de Concepto** a una **Herramienta de Validación**, lo que implicaría:
1.  Implementar `float64` emulado en WGSL.
2.  Añadir determinismo mediante atomics.
3.  Proveer tests de convergencia automatizados contra soluciones exactas conocidas.

**Conclusión**: El proyecto es una excelencia en *divulgación técnica y visualización*, pero requiere una capa adicional de rigor numérico para ser considerado una *herramienta de investigación científica autónoma*.
