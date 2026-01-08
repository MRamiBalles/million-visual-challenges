import json
import math
import os

# BSD Laboratory - Curve Data Generator
# This script generates pre-computed data for selected elliptic curves to be used in the visualizer.
# In a full production environment with SageMath installed, this would use the 'sage' library
# to compute these values dynamically. Here, we provide the exact standard data for the
# representative curves chosen for the laboratory.

OUTPUT_FILE = os.path.join("..", "..", "src", "data", "curves.json")

def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

def generate_curve_data():
    curves = [
        {
            "id": "rank0",
            "name": "Rank 0 (Congruent Number)",
            "lmfdb_label": "32a2",
            "equation_latex": "y^2 = x^3 - x",
            "a_invariants": [0, 0, 0, -1, 0],
            "rank": 0,
            "analytic_rank": 0,
            "generators": [],
            "discriminant": 64,
            "conductor": 32,
            "notes": "Classic example. 1 is a congruent number.",
            # Hypothetical partial products for Prod N_p/p visualization
            # These are illustrative for the visualization
            "convergence_data": [
                {"x": 10, "y": 0.8},
                {"x": 20, "y": 0.6},
                {"x": 50, "y": 0.4},
                {"x": 100, "y": 0.2},
                {"x": 200, "y": 0.1},
                {"x": 500, "y": 0.05}
            ]
        },
        {
            "id": "rank1",
            "name": "Rank 1 (Simple)",
            "lmfdb_label": "37a1",
            "equation_latex": "y^2 + y = x^3 - x",
            "a_invariants": [0, 1, 1, -1, 0], 
            "rank": 1,
            "analytic_rank": 1,
            "generators": ["(0, 0)"],
            "discriminant": 37,
            "conductor": 37,
            "notes": "Smallest conductor curve with rank 1.",
            "convergence_data": [
                 {"x": 10, "y": 1.2},
                 {"x": 50, "y": 2.5},
                 {"x": 100, "y": 3.8},
                 {"x": 500, "y": 5.2},
                 {"x": 1000, "y": 6.5}
            ]
        },
        {
            "id": "rank2",
            "name": "Rank 2 (The Barrier)",
            "lmfdb_label": "389a1",
            "equation_latex": "y^2 + y = x^3 + x^2 - 2x",
            "a_invariants": [0, 1, 1, -2, 0],
            "rank": 2,
            "analytic_rank": 2,
            "generators": ["(-1, 1)", "(0, 0)"], # Simplified for display
            "discriminant": 389,
            "conductor": 389,
            "notes": "Classic Rank 2 example. Heegner points behave trivially here.",
            "convergence_data": [
                 {"x": 10, "y": 1.5},
                 {"x": 50, "y": 4.0},
                 {"x": 100, "y": 8.5},
                 {"x": 500, "y": 15.2},
                 {"x": 1000, "y": 25.0} # Grows like (log X)^2
            ]
        },
         {
            "id": "rank3",
            "name": "Rank 3 (High Complexity)",
            "lmfdb_label": "5077a1",
            "equation_latex": "y^2 + y = x^3 - 7x + 6",
            "a_invariants": [0, 0, 1, -7, 6],
            "rank": 3,
            "analytic_rank": 3,
            "generators": ["(-2, 3)", "(0, 2)", "(1, 0)"], 
            "discriminant": 5077,
            "conductor": 5077,
            "notes": "Gauss Class Number Problem related.",
            "convergence_data": [
                 {"x": 10, "y": 2.0},
                 {"x": 50, "y": 8.0},
                 {"x": 100, "y": 20.0},
                 {"x": 500, "y": 60.0},
                 {"x": 1000, "y": 120.0} # Grows like (log X)^3
            ]
        }
    ]
    
    return curves

def main():
    print(f"Generating elliptic curve data...")
    data = generate_curve_data()
    
    # Calculate more realistic 'simulated' convergence data if needed
    # For now, we use the hardcoded illustrative points which are sufficient for Phase 1 visualization
    
    ensure_dir(OUTPUT_FILE)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully wrote {len(data)} curves to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
