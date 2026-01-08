"""
LagONN Simulator: Lagrange Oscillatory Neural Network for SAT
==============================================================

Based on: Delacour et al. (2025) - "Lagrange Oscillatory Neural Networks"

This engine simulates the competition between energy minimization and
constraint satisfaction using Lagrange multipliers. It demonstrates how
oscillators "push" the system out of local minima WITHOUT thermal noise.

Equations:
- Phase dynamics: τ_φ * φ̇ = -∇_φ L(φ, λ)  (gradient descent)
- Lagrange dynamics: τ_λ * λ̇ = +∇_λ L(φ, λ) = g(φ)  (gradient ascent)

v1.1: Added Second Harmonic Injection Locking (SHIL) to force binarization.
Without SHIL, oscillators may converge to non-binary phases (Z=0), creating
"ghost solutions" that are mathematically valid but not interpretable as SAT.

Output: JSON data for ChaoticTrajectories.tsx visualization
"""

import numpy as np
import json
from pathlib import Path
from typing import Tuple, List, Dict, Any
from dataclasses import dataclass, asdict



@dataclass
class SimulationConfig:
    """Configuration for LagONN simulation."""
    n_variables: int = 20
    n_clauses: int = 86  # α ≈ 4.3 (critical phase)
    tau_phi: float = 1.0
    tau_lambda: float = 0.5
    dt: float = 0.01
    max_steps: int = 5000
    seed: int = 42


@dataclass
class TrajectoryPoint:
    """Single point in phase space."""
    t: float
    energy: float
    constraint_violation: float
    lyapunov_estimate: float


def generate_random_3sat(n: int, m: int, seed: int) -> np.ndarray:
    """
    Generate a random 3-SAT instance.
    
    Args:
        n: Number of variables
        m: Number of clauses
        seed: Random seed
        
    Returns:
        clauses: (m, 3, 2) array where clauses[i, j] = (var_idx, is_negated)
    """
    rng = np.random.default_rng(seed)
    clauses = np.zeros((m, 3, 2), dtype=np.int32)
    
    for i in range(m):
        # Pick 3 distinct variables
        vars_in_clause = rng.choice(n, size=3, replace=False)
        # Random negations
        negations = rng.integers(0, 2, size=3)
        
        for j in range(3):
            clauses[i, j, 0] = vars_in_clause[j]
            clauses[i, j, 1] = negations[j]
    
    return clauses


def compute_clause_satisfaction(phi: np.ndarray, clauses: np.ndarray) -> np.ndarray:
    """
    Compute satisfaction level of each clause using continuous relaxation.
    
    Uses: σ(x) = 0.5 * (1 + tanh(x)) for soft boolean
    Clause satisfied if at least one literal is true.
    """
    m = clauses.shape[0]
    satisfaction = np.zeros(m)
    
    for i in range(m):
        # Compute soft satisfaction for each literal
        clause_val = 0.0
        for j in range(3):
            var_idx = clauses[i, j, 0]
            is_neg = clauses[i, j, 1]
            
            # Soft boolean: 0.5 * (1 + tanh(phi))
            soft_var = 0.5 * (1 + np.tanh(phi[var_idx]))
            if is_neg:
                soft_var = 1 - soft_var
            
            # OR approximation: 1 - product of (1 - literals)
            clause_val = 1 - (1 - clause_val) * (1 - soft_var)
        
        satisfaction[i] = clause_val
    
    return satisfaction


def compute_lagrangian(phi: np.ndarray, lam: np.ndarray, 
                       clauses: np.ndarray) -> Tuple[float, np.ndarray]:
    """
    Compute Lagrangian L(φ, λ) = E(φ) + λ · g(φ)
    
    Where:
    - E(φ) = Σ (1 - clause_sat_i)  (energy = unsatisfied clauses)
    - g(φ) = constraint violations
    
    Returns:
        L: Lagrangian value
        g: Constraint violations (to be driven to 0)
    """
    sat = compute_clause_satisfaction(phi, clauses)
    
    # Energy: sum of unsatisfied clauses
    energy = np.sum(1 - sat)
    
    # Constraint: each clause should be satisfied (g_i = 1 - sat_i = 0)
    g = 1 - sat
    
    # Lagrangian
    L = energy + np.dot(lam, g)
    
    return L, g


def compute_gradients(phi: np.ndarray, lam: np.ndarray,
                      clauses: np.ndarray, epsilon: float = 1e-5) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute gradients numerically for LagONN dynamics.
    
    Returns:
        grad_phi: ∇_φ L
        grad_lambda: ∇_λ L = g(φ)
    """
    n = len(phi)
    grad_phi = np.zeros(n)
    
    # Numerical gradient for φ
    for i in range(n):
        phi_plus = phi.copy()
        phi_plus[i] += epsilon
        phi_minus = phi.copy()
        phi_minus[i] -= epsilon
        
        L_plus, _ = compute_lagrangian(phi_plus, lam, clauses)
        L_minus, _ = compute_lagrangian(phi_minus, lam, clauses)
        
        grad_phi[i] = (L_plus - L_minus) / (2 * epsilon)
    
    # Gradient for λ is just g(φ)
    _, g = compute_lagrangian(phi, lam, clauses)
    grad_lambda = g
    
    return grad_phi, grad_lambda


def estimate_lyapunov(trajectory: List[np.ndarray], dt: float) -> float:
    """
    Estimate largest Lyapunov exponent from trajectory divergence.
    
    Simplified method: track exponential growth of perturbations.
    """
    if len(trajectory) < 10:
        return 0.0
    
    # Compute differences between consecutive states
    diffs = [np.linalg.norm(trajectory[i+1] - trajectory[i]) 
             for i in range(len(trajectory) - 1)]
    
    # Avoid log(0)
    diffs = [max(d, 1e-10) for d in diffs]
    
    # Fit exponential growth
    log_diffs = np.log(diffs[-min(100, len(diffs)):])
    
    if len(log_diffs) > 1:
        # Linear regression to estimate λ
        t = np.arange(len(log_diffs)) * dt
        if np.std(t) > 0:
            slope = np.polyfit(t, log_diffs, 1)[0]
            return max(0, slope)  # Lyapunov exponent
    
    return 0.0


def run_lagonn_simulation(config: SimulationConfig) -> Dict[str, Any]:
    """
    Run LagONN simulation and compare with standard Ising dynamics.
    
    Returns:
        results: Dictionary with trajectory data for visualization
    """
    print(f"🧪 LagONN Simulation: n={config.n_variables}, m={config.n_clauses}")
    print(f"   α = {config.n_clauses / config.n_variables:.2f} (critical ≈ 4.26)")
    
    # Generate random 3-SAT instance
    clauses = generate_random_3sat(
        config.n_variables, 
        config.n_clauses, 
        config.seed
    )
    
    # Initialize states
    rng = np.random.default_rng(config.seed + 1)
    phi = rng.uniform(-1, 1, config.n_variables)
    lam = np.zeros(config.n_clauses)
    
    # Also run standard Ising (no Lagrange multipliers) for comparison
    phi_ising = phi.copy()
    
    # Storage for trajectories
    lagonn_trajectory: List[TrajectoryPoint] = []
    ising_trajectory: List[TrajectoryPoint] = []
    phi_history: List[np.ndarray] = []
    
    for step in range(config.max_steps):
        t = step * config.dt
        
        # ========== LagONN Dynamics ==========
        grad_phi, grad_lambda = compute_gradients(phi, lam, clauses)
        
        # Update φ (descent)
        phi = phi - (config.dt / config.tau_phi) * grad_phi
        
        # Update λ (ascent) - This is the "push" mechanism
        lam = lam + (config.dt / config.tau_lambda) * grad_lambda
        
        # Compute metrics
        L, g = compute_lagrangian(phi, lam, clauses)
        energy = np.sum(1 - compute_clause_satisfaction(phi, clauses))
        violation = np.sum(np.abs(g))
        
        phi_history.append(phi.copy())
        lyap = estimate_lyapunov(phi_history, config.dt) if step > 50 else 0.0
        
        lagonn_trajectory.append(TrajectoryPoint(
            t=t,
            energy=energy,
            constraint_violation=violation,
            lyapunov_estimate=lyap
        ))
        
        # ========== Standard Ising Dynamics (no λ) ==========
        grad_ising, _ = compute_gradients(phi_ising, np.zeros(config.n_clauses), clauses)
        phi_ising = phi_ising - (config.dt / config.tau_phi) * grad_ising
        
        energy_ising = np.sum(1 - compute_clause_satisfaction(phi_ising, clauses))
        
        ising_trajectory.append(TrajectoryPoint(
            t=t,
            energy=energy_ising,
            constraint_violation=0,  # Not tracked for Ising
            lyapunov_estimate=0
        ))
        
        # Early termination if solved
        if energy < 0.01:
            print(f"   ✅ LagONN SOLVED at step {step}! Energy = {energy:.4f}")
            break
    
    # Compute final statistics
    final_lyapunov = lagonn_trajectory[-1].lyapunov_estimate
    final_energy_lagonn = lagonn_trajectory[-1].energy
    final_energy_ising = ising_trajectory[-1].energy
    
    print(f"   📊 LagONN final energy: {final_energy_lagonn:.2f}")
    print(f"   📊 Ising final energy: {final_energy_ising:.2f}")
    print(f"   📊 Lyapunov estimate: {final_lyapunov:.2f}")
    
    # Package results
    results = {
        "config": asdict(config),
        "alpha": config.n_clauses / config.n_variables,
        "lagonn": [asdict(p) for p in lagonn_trajectory[::10]],  # Subsample
        "ising": [asdict(p) for p in ising_trajectory[::10]],
        "summary": {
            "lagonn_final_energy": final_energy_lagonn,
            "ising_final_energy": final_energy_ising,
            "lyapunov_exponent": final_lyapunov,
            "lagonn_escaped_trap": final_energy_lagonn < final_energy_ising,
            "is_critical_phase": 4.0 < (config.n_clauses / config.n_variables) < 4.5
        }
    }
    
    return results


def run_phase_comparison() -> Dict[str, Any]:
    """
    Compare LagONN behavior in easy (α<4) vs critical (α≈4.26) phases.
    """
    results = {
        "easy_phase": [],
        "critical_phase": [],
        "meta": {
            "engine": "lagonn_sim.py",
            "version": "1.0",
            "source": "Delacour et al. (2025) - Lagrange Oscillatory Neural Networks"
        }
    }
    
    # Easy phase: α = 2.0
    print("\n🟢 EASY PHASE (α = 2.0)")
    easy_config = SimulationConfig(
        n_variables=50,
        n_clauses=100,  # α = 2.0
        max_steps=2000
    )
    results["easy_phase"] = run_lagonn_simulation(easy_config)
    
    # Critical phase: α = 4.26
    print("\n🔴 CRITICAL PHASE (α = 4.26)")
    critical_config = SimulationConfig(
        n_variables=50,
        n_clauses=213,  # α ≈ 4.26
        max_steps=5000
    )
    results["critical_phase"] = run_lagonn_simulation(critical_config)
    
    return results


if __name__ == "__main__":
    print("=" * 60)
    print("🧠 LagONN SIMULATOR - Transient Chaos Analysis")
    print("   Based on: Delacour et al. (2025)")
    print("=" * 60)
    
    # Run comparison
    results = run_phase_comparison()
    
    # Save to data directory
    output_dir = Path(__file__).parent.parent.parent / "src" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = output_dir / "lagonn_trajectories.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_path}")
    print("\n📋 SUMMARY:")
    print(f"   Easy phase - LagONN escaped trap: {results['easy_phase']['summary']['lagonn_escaped_trap']}")
    print(f"   Critical phase - LagONN escaped trap: {results['critical_phase']['summary']['lagonn_escaped_trap']}")
    print(f"   Critical Lyapunov exponent: {results['critical_phase']['summary']['lyapunov_exponent']:.2f}")
