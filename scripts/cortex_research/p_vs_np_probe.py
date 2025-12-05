"""
Cortex-13 Research Protocol: SAT-Probe (P vs NP Investigation)

This script trains a small Cortex-13 model to solve 3-SAT (Boolean Satisfiability) instances.
The goal is NOT to solve P=NP, but to inspect the "Glass Box" (attention/activations)
to see if the model learns heuristics that differentiate satisfiable from unsatisfiable formulas
in a statistically significant way, arguably hinting at 'shortcuts'.

Usage:
    python p_vs_np_probe.py
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from model import CortexV2, CortexConfig, train_model
import random
import numpy as np

# --- 1. Synthetic Data Generation (3-SAT) ---
def generate_3sat_instance(n_vars=5, n_clauses=10):
    """
    Generates a random 3-SAT formula and its solution (if simple).
    Format: "x1 v ~x2 v x3 ^ ~x1 v x4 v x5 ..."
    """
    vars = [f"x{i}" for i in range(1, n_vars+1)]
    clauses = []
    
    for _ in range(n_clauses):
        c_vars = random.sample(vars, 3)
        c_lits = [v if random.random() > 0.5 else f"~{v}" for v in c_vars]
        clauses.append("(" + " v ".join(c_lits) + ")")
        
    formula = " ^ ".join(clauses)
    return formula

# For a transformer, we tokenize characters.
# We will treat this as a classification problem:
# Input: Formula string -> Output: "SAT" or "UNSAT" token

def generate_dataset(size=1000):
    """
    Generates a dummy dataset for demonstration.
    Real implementation would use a rigorous SAT solver (e.g. pycosat) to label.
    Here we randomly assign labels for the PROTOTYPE to verify architecture flow.
    """
    data_raw = ""
    for _ in range(size):
        # We append a solution token at the end
        label = "SAT" if random.random() > 0.5 else "UNSAT"
        formula = generate_3sat_instance()
        data_raw += f"{formula} = {label}\n"
        
    return torch.tensor([ord(c) for c in data_raw], dtype=torch.long)

# --- 2. The Probe ---
def run_probe():
    print("🔎 Starting SAT-Probe Protocol...")
    
    # Config tailored for logical depth
    cfg = CortexConfig(
        n_layers=6,      # Deeper for logical reasoning
        d_model=128,
        n_heads=8,
        vocab_size=128,  # ASCII
        block_size=256,
        qualifier_steps=50 # Fast demo run
    )
    
    # Data
    print("📚 Generating Logical Corpus (3-SAT)...")
    data = generate_dataset(size=2000)
    
    # Model
    model = CortexV2(cfg, arch_type='T').to(cfg.device) # Pure Transformer
    print(f"🧠 Logic Engine Initialized: {model.count_params()/1e6:.2f}M params")
    
    # Train
    print("🏋️ Training on Boolean Logic...")
    losses, _ = train_model(model, cfg, data, cfg.qualifier_steps)
    
    # Visualization Hook
    # We would export attention maps here to see if the model attends to
    # contradicting clauses (e.g., (A v B) and (~A v ~B)).
    
    print("\n✅ Probe Complete. This script proves the architecture can ingest logical formulas.")
    print("   Next Step: Connect 'activations' to GlassBrain.tsx explicitly.")

if __name__ == "__main__":
    run_probe()
