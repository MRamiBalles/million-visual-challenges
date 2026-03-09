
import random

def evaluarSolucion(solucion, flujo, distancia):
    coste = 0
    n = len(solucion)
    for i in range(n):
        for j in range(n):
            if i != j:
                coste += flujo[i][j] * distancia[solucion[i]][solucion[j]]
    return coste

def calcularDelta(r, s, solucion, flujo, distancia):
    delta = 0
    n = len(solucion)
    u_r = solucion[r]
    u_s = solucion[s]
    
    for k in range(n):
        if k != r and k != s:
            u_k = solucion[k]
            # Restar contribución antigua
            delta -= (flujo[r][k] * distancia[u_r][u_k] + flujo[k][r] * distancia[u_k][u_r] +
                      flujo[s][k] * distancia[u_s][u_k] + flujo[k][s] * distancia[u_k][u_s])
            
            # Sumar contribución nueva
            delta += (flujo[r][k] * distancia[u_s][u_k] + flujo[k][r] * distancia[u_k][u_s] +
                      flujo[s][k] * distancia[u_r][u_k] + flujo[k][s] * distancia[u_k][u_r])
    
    # Add interaction between r and s
    delta -= (flujo[r][s] * distancia[u_r][u_s] + flujo[s][r] * distancia[u_s][u_r])
    delta += (flujo[r][s] * distancia[u_s][u_r] + flujo[s][r] * distancia[u_r][u_s])
            
    return delta

# Test Logic
n = 5
F = [[random.randint(1,10) if i!=j else 0 for j in range(n)] for i in range(n)]
D = [[random.randint(1,10) if i!=j else 0 for j in range(n)] for i in range(n)]
sol = list(range(n))
random.shuffle(sol)

coste_inicial = evaluarSolucion(sol, F, D)
delta_calc = calcularDelta(0, 1, sol, F, D)

# Swap
sol[0], sol[1] = sol[1], sol[0]
coste_final = evaluarSolucion(sol, F, D)

print(f"Coste Inicial: {coste_inicial}")
print(f"Coste Final:   {coste_final}")
print(f"Diferencia Real: {coste_final - coste_inicial}")
print(f"Delta Calculado: {delta_calc}")

if delta_calc == (coste_final - coste_inicial):
    print("SUCCESS: Delta logic is correct.")
else:
    print("FAILURE: Delta logic is incorrect.")
