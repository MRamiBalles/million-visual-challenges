
import random
import copy

# --- Core Logic (From Sprint 1) ---
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
            delta -= (flujo[r][k] * distancia[u_r][u_k] + flujo[k][r] * distancia[u_k][u_r] +
                      flujo[s][k] * distancia[u_s][u_k] + flujo[k][s] * distancia[u_k][u_s])
            delta += (flujo[r][k] * distancia[u_s][u_k] + flujo[k][r] * distancia[u_k][u_s] +
                      flujo[s][k] * distancia[u_r][u_k] + flujo[k][s] * distancia[u_k][u_r])
    
    delta -= (flujo[r][s] * distancia[u_r][u_s] + flujo[s][r] * distancia[u_s][u_r])
    delta += (flujo[r][s] * distancia[u_s][u_r] + flujo[s][r] * distancia[u_r][u_s])
    return delta

# --- Local Search Algorithms ---

def best_improvement(solucion, flujo, distancia):
    n = len(solucion)
    current_sol = list(solucion)
    current_cost = evaluarSolucion(current_sol, flujo, distancia)
    mejora = True
    steps = 0
    
    print(f"DEBUG: Start Best Improvement. Initial Cost: {current_cost}")
    
    while mejora:
        mejora = False
        mejor_delta = 0
        mejor_r, mejor_s = -1, -1
        
        for r in range(n):
            for s in range(r + 1, n):
                delta = calcularDelta(r, s, current_sol, flujo, distancia)
                if delta < mejor_delta:
                    mejor_delta = delta
                    mejor_r, mejor_s = r, s
                    
        if mejor_r != -1:
            # Check Consistency locally
            current_sol[mejor_r], current_sol[mejor_s] = current_sol[mejor_s], current_sol[mejor_r]
            current_cost += mejor_delta
            steps += 1
            mejora = True
            
            # Verify Monotonicity check implicitly handled by condition
            
    # Final Consistency Check
    recalculated_cost = evaluarSolucion(current_sol, flujo, distancia)
    print(f"DEBUG: End Best Steps: {steps}. Incremental Cost: {current_cost}. Real Cost: {recalculated_cost}")
    
    if current_cost != recalculated_cost:
        print("CRITICAL ERROR: Incremental cost diverged from real cost!")
        return None, -1
        
    return current_sol, current_cost

def first_improvement(solucion, flujo, distancia, seed):
    random.seed(seed)
    n = len(solucion)
    current_sol = list(solucion)
    current_cost = evaluarSolucion(current_sol, flujo, distancia)
    mejora = True
    steps = 0
    
    # Generate all pairs
    neighbors = []
    for r in range(n):
        for s in range(r + 1, n):
            neighbors.append((r, s))
            
    while mejora:
        mejora = False
        random.shuffle(neighbors) # Randomize check order
        
        for r, s in neighbors:
            delta = calcularDelta(r, s, current_sol, flujo, distancia)
            
            if delta < 0:
                current_sol[r], current_sol[s] = current_sol[s], current_sol[r]
                current_cost += delta
                steps += 1
                mejora = True
                break # First Improvement: Apply and Restart
    
    recalculated_cost = evaluarSolucion(current_sol, flujo, distancia)
    # print(f"DEBUG (First, Seed {seed}): Steps: {steps}. Final Cost: {current_cost}")
    
    if current_cost != recalculated_cost:
        print(f"CRITICAL ERROR (First): Incremental cost diverged! {current_cost} vs {recalculated_cost}")
    
    return current_sol, current_cost

# --- Test Runner ---
print("--- Running Local Search Validation ---")
N = 20 # Small instance for speed
F = [[random.randint(0,10) if i!=j else 0 for j in range(N)] for i in range(N)]
D = [[random.randint(0,10) if i!=j else 0 for j in range(N)] for i in range(N)]
sol_ini = list(range(N))
random.shuffle(sol_ini)

# Test 1: Best Improvement Consistency
print("\n[Test 1] Best Improvement Consistency")
sol_best, cost_best = best_improvement(sol_ini, F, D)
if cost_best != -1:
    print("SUCCESS: Best Improvement ensures cost consistency.")

# Test 2: First Improvement Stochasticity
print("\n[Test 2] First Improvement Stochasticity (5 seeds)")
set_results = set()
for s in range(5):
    _, c = first_improvement(sol_ini, F, D, seed=s)
    set_results.add(c)
    print(f"Seed {s}: Cost {c}")

if len(set_results) > 1:
    print(f"SUCCESS: First Improvement is stochastic (Found {len(set_results)} different outcomes).")
else:
    print("WARNING: First Improvement produced identical results (could happen on small random data, but check logic).")
