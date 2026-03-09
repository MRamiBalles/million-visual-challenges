import pytest
import json
import os
from engines.physics.yang_mills_rigor import YangMillsMERASolver
from engines.math.riemann_rigor import RiemannShimizuAuditor
from engines.math.bsd_rigor import BSDRigorSolver
from engines.math.hodge_rigor import HodgeRigorSolver

def test_yang_mills_rigor():
    solver = YangMillsMERASolver(coupling_g=0.5)
    cert = solver.certify({"mass_gev": 2.370})
    assert cert["is_mass_gap_positive"] == True
    assert cert["certification_status"] == "VALIDATED"

def test_riemann_rigor():
    auditor = RiemannShimizuAuditor(num_zeros=10)
    cert = auditor.certify()
    assert cert["critical_line_verified"] == True
    assert cert["max_critical_line_discrepancy"] < 1e-10

def test_bsd_rigor():
    solver = BSDRigorSolver()
    # Mock de curva rango 1 (compatible con BSD si L(1) es pequeño)
    curve_data = {
        "label": "test_curve",
        "rank": 1,
        "l_values": {"L_at_1": 1e-12}
    }
    cert = solver.certify_curve(curve_data)
    assert cert["bsd_consistency"] == True

def test_hodge_rigor():
    solver = HodgeRigorSolver(max_nodes=10)
    # Clase con k=5 (Constructible)
    hodge_class = {"label": "test", "coefficients": [1, 2, -2]}
    result = solver.verify_nodal_constructivity(hodge_class)
    assert result["is_algebraic_cycle_constructible"] == True
    
    # Clase con k=15 (No Constructible según cota cuártica)
    hodge_class_heavy = {"label": "test_heavy", "coefficients": [1, 7, -7]}
    result_heavy = solver.verify_nodal_constructivity(hodge_class_heavy)
    assert result_heavy["is_algebraic_cycle_constructible"] == False
