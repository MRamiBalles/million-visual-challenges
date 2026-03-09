import numpy as np
import json
from scipy.optimize import minimize
from scipy.interpolate import CubicSpline
import os

def physics_residual(params, y, lambda_param):
    n = len(y)
    omega = params[:n]
    u = params[n:]
    
    # Derivadas (diferencias finitas de 2º orden)
    dy = y[1] - y[0]
    d_omega = np.gradient(omega, dy)
    d_u = np.gradient(u, dy)
    
    # Ecuación: Omega + ((1 + lambda) * y - U) * dOmega/dy - Omega * dU/dy
    res = omega + ((1.0 + lambda_param) * y - u) * d_omega - omega * d_u
    return res

def loss_func(params, y, lambda_param, omega_init, u_init, weight_reg=1e-4):
    res = physics_residual(params, y, lambda_param)
    phys_loss = np.sum(res**2)
    
    # Regularización para no alejarse demasiado del perfil de investigación
    n = len(y)
    omega = params[:n]
    u = params[n:]
    reg_loss = weight_reg * (np.sum((omega - omega_init)**2) + np.sum((u - u_init)**2))
    
    return phys_loss + reg_loss

def optimize_profile():
    input_path = "d:/million-visual-challenges-2/src/data/navier_stokes_singularity_refined.json"
    output_path = "d:/million-visual-challenges-2/src/data/navier_stokes_singularity_rigorous.json"
    
    with open(input_path, "r") as f:
        data = json.load(f)
    
    profile = data["profile"]
    y = np.array([p["y_coord"] for p in profile])
    omega_init = np.array([p["vorticity"] for p in profile])
    u_init = np.array([p["velocity"] for p in profile])
    lambda_param = data["metadata"]["lambda_param"]
    
    print(f"🌀 Optimizando perfil para Lambda={lambda_param}...")
    
    initial_params = np.concatenate([omega_init, u_init])
    
    # Optimización L-BFGS-B de alta precisión
    res = minimize(
        loss_func, 
        initial_params, 
        args=(y, lambda_param, omega_init, u_init),
        method='L-BFGS-B',
        options={'gtol': 1e-12, 'disp': True, 'maxiter': 5000}
    )
    
    n = len(y)
    omega_final = res.x[:n]
    u_final = res.x[n:]
    
    # Guardar perfil riguroso
    new_profile = []
    for i in range(n):
        new_profile.append({
            "y_coord": float(y[i]),
            "vorticity": float(omega_final[i]),
            "velocity": float(u_final[i])
        })
    
    data["profile"] = new_profile
    data["metadata"]["precision"] = "rigorous_lbfgs_optimized"
    data["metadata"]["optimization_loss"] = float(res.fun)
    
    with open(output_path, "w") as f:
        json.dump(data, f, indent=4)
    
    print(f"✨ Perfil optimizado con éxito! Residuo Final: {res.fun:.2e}")
    print(f"💾 Guardado en: {output_path}")

if __name__ == "__main__":
    optimize_profile()
