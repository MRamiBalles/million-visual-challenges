import pytest
from engines.physics.navier_stokes_rigor import NavierStokesIntervalSolver
import numpy as np

def test_interval_solver_initialization():
    solver = NavierStokesIntervalSolver(lambda_val=0.4713)
    assert str(solver.lambda_iv).startswith('0.4713')

def test_residual_calculation_magnitude():
    # Un perfil que no es solución debe tener residuos grandes
    solver = NavierStokesIntervalSolver(lambda_val=0.4713)
    y = np.linspace(-1, 1, 10).tolist()
    Omega = [1.0] * 10
    
    res = solver.residual_euler_autosimilar(Omega, y)
    # Para Omega constante, el término (1+lambda)y*dOmega es 0, residuo debe ser -1
    assert all([abs(r + 1.0) < 0.1 for r in res])

def test_verification_workflow():
    solver = NavierStokesIntervalSolver(lambda_val=0.4713)
    data = {
        "y": [0.0, 1.0, 2.0],
        "Omega": [0.0, 0.0, 0.0] # Solución trivial 0 = 0
    }
    cert = solver.verify_profile(data)
    # La solución trivial debe verificar (residuo 0)
    assert cert["is_verified"] == True
