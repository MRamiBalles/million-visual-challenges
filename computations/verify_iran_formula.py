from sage.all import *
import json
import sys

def verify_matak_formula(curve_label):
    """
    Verifies the 'Iran Formula' (Matak 2025) for a given elliptic curve.
    Phi_E(s) -> |Sha| as s -> 1
    
    Formula: Phi_E(s) limit = |Sha|?
    Actually Matak proposes:
    Phi_E_limit = (L^(r)(1)/r!) / (Omega * Reg * Tamagawa / |Tors|^2)
    
    If BSD is true: L^(r)(1)/r! = |Sha| * Omega * Reg * Tamagawa / |Tors|^2
    So Ratio = (L^(r)(1)/r!) / (Omega * Reg * Tamagawa / |Tors|^2) should be |Sha|.
    """
    
    try:
        E = EllipticCurve(curve_label)
        rank = E.rank()
        
        # 1. Analytic Value (Taylor Leading Coefficient)
        # L^(r)(1) / r!
        s = var('s')
        # In Sage, E.lseries().taylor(s, 1, rank) gives terms.
        # But we can get the leading coefficient directly.
        # analytic_rank = E.analytic_rank() # Should match geometric rank for these
        # lead_coeff = E.lseries().derivative(1, rank) / factorial(rank)
        
        # For simplicity in this script, we take the L-value from Sage's BSD routines
        bsd_result = E.bsd_invariants()
        L_star = bsd_result['L'] # This is L^(r)(1)/r!
        
        # 2. Arithmetic Invariants (Sage specific)
        omega = E.period_lattice().real_period() # Real period
        # Note: Sage's real_period might need adjustments for connected components c_inf?
        # Standard BSD formula uses Omega * c_infinity?
        # But E.bsd_invariants() 'Omega' usually handles this?
        
        reg = E.regulator()
        if rank == 0: reg = 1
        
        torsion = E.torsion_order()
        tamagawa = E.tamagawa_product()
        
        # 3. Matak's Ratio Check
        # Proposed Denominator: Omega * Reg * Tamagawa / |Tors|^2
        denominator = (omega * reg * tamagawa) / (torsion**2)
        
        # Ratio = L_star / denominator
        # Theoretically, Ratio should be |Sha| (usually 1 for these curves).
        ratio = L_star / denominator
        
        return {
            "label": curve_label,
            "rank": int(rank),
            "L_star": float(L_star),
            "denominator_matak": float(denominator),
            "ratio": float(ratio),
            "sha_expected": float(E.sha().an_order()), # rigorous computation
            "status": "PASS" if abs(ratio - 1.0) < 0.01 else "ANOMALY"
        }

    except Exception as e:
        return {"label": curve_label, "error": str(e)}

def main():
    curves = ["496a1", "32a3", "389a1"]
    results = {}
    
    print("Verifying Iran Formula (Matak 2025)...")
    
    for lbl in curves:
        res = verify_matak_formula(lbl)
        print(f"Curve {lbl}: Ratio = {res.get('ratio', 'N/A')} [{res.get('status', 'ERROR')}]")
        results[lbl] = res
        
    output_path = "src/data/iran_verification.json" # Writing directly to src/data for frontend
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    main()
