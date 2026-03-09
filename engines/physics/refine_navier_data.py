import json
import numpy as np
from scipy.interpolate import CubicSpline
import os

def refine_profile():
    input_path = "d:/million-visual-challenges-2/src/data/navier_stokes_singularity.json"
    output_path = "d:/million-visual-challenges-2/src/data/navier_stokes_singularity_refined.json"
    
    with open(input_path, "r") as f:
        data = json.load(f)
    
    profile = data["profile"]
    y_raw = np.array([p["y_coord"] for p in profile])
    omega_raw = np.array([p["vorticity"] for p in profile])
    u_raw = np.array([p.get("velocity", 0.0) for p in profile])
    
    # Crear interpolaciones cúbicas
    cs_omega = CubicSpline(y_raw, omega_raw, bc_type='natural')
    cs_u = CubicSpline(y_raw, u_raw, bc_type='natural')
    
    # Generar 200 puntos (alta resolución)
    y_new = np.linspace(y_raw.min(), y_raw.max(), 200)
    omega_new = cs_omega(y_new)
    u_new = cs_u(y_new)
    
    # Reconstruir la lista de perfil
    new_profile = []
    for yi, oi, ui in zip(y_new, omega_new, u_new):
        new_profile.append({
            "y_coord": float(yi),
            "vorticity": float(oi),
            "velocity": float(ui)
        })
    
    # Actualizar metadata
    data["profile"] = new_profile
    data["simulation_config"]["resolution"] = 200
    data["metadata"]["precision"] = "refined_cubic_spline"
    
    with open(output_path, "w") as f:
        json.dump(data, f, indent=4)
    
    print(f"✅ Perfil refinado generado con {len(new_profile)} puntos en {output_path}")

if __name__ == "__main__":
    refine_profile()
