# BSD Verification Laboratory: Critique & Risks

## Anomalías de Normalización (Benchmarking)

| Curva | Rango | Ratio BSD Observado | Hipótesis / Riesgo |
|-------|-------|---------------------|--------------------|
| 496a1 | 0     | ~0.199              | **Factor Torsión**: Probable influencia de $|E(\mathbb{Q})_{tors}|^2$ en el denominador. Si $|E(\mathbb{Q})_{tors}|=2$ o $Tamagawa=5$, el ratio $1/5$ es consistente. |
| 32a3  | 1     | ~2.28               | **Caso Matak**: Objeto de estudio principal. El exceso de 2.28 sobre 1.0 sugiere una desincronización en la escala del Periodo Real $\Omega_E$ o factores de Tamagawa locales. |
| 389a1 | 2     | ~1.99               | **Factor 2 (Periodos)**: Anomalía clásica en curvas con múltiples componentes conexas reales. El periodo real calculado por librerías estándar a menudo difiere por un factor de 2 de la definición BSD pura. |

## Riesgos Teóricos (Fórmula de Irán & Whittaker)

### 1. Invariancia de Escala en $\phi_E(s)$
La teoría de Matak afirma que $\phi_E(s) = (s-1)\frac{L'(E,s)}{L(E,s)} \to r$ cuando $s \to 1$. 
- **Riesgo**: Los errores numéricos en el cálculo de $L(E,s)$ (especialmente para rangos altos) pueden causar divergencias espurias cerca de $s=1$. 
- **Mitigación**: Usar aproximaciones de Taylor de alto orden para la línea base y comparar con las series de Dirichlet truncadas.

### 2. Colapso de Heegner en Rango 2
Para la curva 389a1, los puntos de Heegner colapsan a torsión. 
- **Riesgo**: La "Fórmula de Irán" depende de la estructura espectral de la curva modular asociada. Un fallo en la identificación de autovalores en el Hamiltoniano de Whittaker resultaría en una predicción de rango errónea (probablemente $r=0$).

### 3. Normalización del Operador Espectral
Whittaker (2025) propone un operador cuya autovalores codifican los factores aritméticos ($Sha$, Tamagawa). 
- **Riesgo**: La "anomalía de normalización" detectada (Factor 2.0) podría ser interpretada erróneamente como un autovalor físico si no se aisla correctamente de la geometría compleja de la curva.
