import numpy as np
import time
import json
import os

class QAPAuditor:
    def __init__(self, n=0):
        self.n = n
        self.flow = None
        self.dist = None
        self.num_evals = 0

    def load_instance(self, path):
        if not os.path.exists(path):
            print(f"Error: Archivo {path} no encontrado.")
            return False
        
        with open(path, 'r') as f:
            lines = f.readlines()
            # Limpiar líneas de comentarios o vacías si las hay
            content = [line.strip() for line in lines if line.strip()]
            
            self.n = int(content[0])
            all_numbers = []
            for line in content[1:]:
                all_numbers.extend(map(int, line.split()))
            
            # Matriz de Flujo
            self.flow = np.array(all_numbers[:self.n*self.n]).reshape((self.n, self.n))
            # Matriz de Distancia
            self.dist = np.array(all_numbers[self.n*self.n:]).reshape((self.n, self.n))
        return True

    def evaluate(self, solution):
        self.num_evals += 1
        cost = 0
        for i in range(self.n):
            for j in range(self.n):
                if i != j:
                    cost += self.flow[i][j] * self.dist[solution[i]][solution[j]]
        return cost

    def greedy_potential(self):
        # 1. Potenciales de flujo
        flow_pot = np.sum(self.flow, axis=1) + np.sum(self.flow, axis=0)
        # 2. Potenciales de distancia
        dist_pot = np.sum(self.dist, axis=1) + np.sum(self.dist, axis=0)
        
        # 3. Ordenar
        flow_indices = np.argsort(-flow_pot) # Mayor flujo primero
        dist_indices = np.argsort(dist_pot)  # Menor distancia (céntrica) primero
        
        # 4. Asignar
        solution = [0] * self.n
        for i in range(self.n):
            solution[flow_indices[i]] = dist_indices[i]
        
        return solution

    def local_search_best(self, initial_solution):
        solution = list(initial_solution)
        current_cost = self.evaluate(solution)
        improved = True
        
        while improved:
            improved = False
            best_delta = 0
            best_move = None
            
            for r in range(self.n):
                for s in range(r + 1, self.n):
                    # Cálculo de Delta (simplificado para Python, optimizar si n > 100)
                    delta = self._calculate_delta(r, s, solution)
                    if delta < best_delta:
                        best_delta = delta
                        best_move = (r, s)
            
            if best_move:
                r, s = best_move
                solution[r], solution[s] = solution[s], solution[r]
                current_cost += best_delta
                improved = True
                
        return solution, current_cost

    def _calculate_delta(self, r, s, solution):
        # Delta O(n)
        u_r = solution[r]
        u_s = solution[s]
        delta = 0
        for k in range(self.n):
            if k != r and k != s:
                u_k = solution[k]
                # Restar antigua contribución
                delta -= (self.flow[r][k] * self.dist[u_r][u_k] + self.flow[k][r] * self.dist[u_k][u_r] +
                          self.flow[s][k] * self.dist[u_s][u_k] + self.flow[k][s] * self.dist[u_k][u_s])
                # Sumar nueva contribución
                delta += (self.flow[r][k] * self.dist[u_s][u_k] + self.flow[k][r] * self.dist[u_k][u_s] +
                          self.flow[s][k] * self.dist[u_r][u_k] + self.flow[k][s] * self.dist[u_k][u_r])
        
        # Interacción r <-> s
        delta -= (self.flow[r][s] * self.dist[u_r][u_s] + self.flow[s][r] * self.dist[u_s][u_r])
        delta += (self.flow[r][s] * self.dist[u_s][u_r] + self.flow[s][r] * self.dist[u_r][u_s])
        return delta

def run_audit(instance_name):
    auditor = QAPAuditor()
    data_path = f"d:/million-visual-challenges-2/engines/qap_case_study/data/{instance_name.lower()}.dat"
    
    if not auditor.load_instance(data_path):
        return

    print(f"\n--- AUDITORIA PYTHON QAP: {instance_name} (N={auditor.n}) ---")
    
    # Greedy (P)
    start = time.time()
    sol_greedy = auditor.greedy_potential()
    cost_greedy = auditor.evaluate(sol_greedy)
    time_greedy = (time.time() - start) * 1000
    print(f"Greedy (P) Coste: {cost_greedy} | Tiempo: {time_greedy:.2f}ms")
    
    # Local Search (NP)
    np.random.seed(42)
    sol_ini = np.random.permutation(auditor.n)
    start = time.time()
    sol_ls, cost_ls = auditor.local_search_best(sol_ini)
    time_ls = (time.time() - start) * 1000
    print(f"LS Best (NP) Coste: {cost_ls} | Tiempo: {time_ls:.2f}ms")
    
    # Gap
    gap = ((cost_greedy - cost_ls) / cost_ls) * 100 if cost_ls != 0 else 0
    print(f"OBSTRUCCIÓN DETECTADA (GAP): {gap:.2f}%")
    
    if gap > 15:
        print("RESULTADO: Alta rugosidad. Evidencia empírica de obstrucción topológica.")
    else:
        print("RESULTADO: Paisaje suave.")

if __name__ == "__main__":
    run_audit("tai25b")
    run_audit("nug5")
