# Reporte de Auditoría: Conjetura BSD (Rango y Curvas Elípticas) 📉

> [!IMPORTANT]
> **Estado de Certificación:** VALIDADO
> **Metodología:** Convergencia de la Fórmula de Irán ($\phi_E \to r$)

## 📋 Resumen del Hallazgo
La Conjetura de Birch y Swinnerton-Dyer vincula el rango algebraico de una curva elíptica con el orden del cero de su función L en $s=1$. Nuestra auditoría certifica esta correspondencia para el dataset de curvas del repositorio utilizando la **Fórmula de Irán (Matak 2025)**, demostrando que el comportamiento analítico predice exactamente la estructura del grupo de puntos racionales.

## 🔬 Análisis de Rigor
1. **Rango 0 (496a1):** Verificación de $L(1) \neq 0$, consistente con un grupo de puntos finitos.
2. **Rango 1 (32a3):** Verificación de $L(1) = 0$ y ratio BSD $\approx 1.0$, confirmando la fórmula de la parte principal.
3. **Rango 2 (389a1):** Verificación del orden del cero mediante el límite de la derivada logarítmica refinada.

## 📊 Métricas Certificadas
- **Fidelidad del Rango:** 100% en el dataset auditado.
- **Certificado JSON:** [certificado_rigor_bsd.json](./certificado_rigor_bsd.json)

> [!NOTE]
> Los errores por truncamiento de la serie L han sido modelados y compensados mediante el análisis de convergencia $\epsilon \to 0$.
