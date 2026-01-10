import torch
import torch.nn as nn
import numpy as np
import json
import os
import time

# Configuración del dispositivo (GPU si está disponible para acelerar como en el paper)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🚀 Iniciando Motor de Singularidad PINN en: {device}")

# -------------------------------------------------------------------------
# 1. DEFINICIÓN DEL MODELO PINN (Red Neuronal Informada por la Física)
# -------------------------------------------------------------------------
# -------------------------------------------------------------------------
# 1. DEFINICIÓN DEL MODELO PINN (Red Neuronal Informada por la Física)
# -------------------------------------------------------------------------
class SingularityNet(nn.Module):
    def __init__(self, hidden_dim=64):
        super().__init__()
        # Arquitectura MLP profunda para capturar gradientes altos
        self.net = nn.Sequential(
            nn.Linear(1, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, 2)  # [Omega, U]
        )

    def forward(self, y):
        return self.net(y)

# -------------------------------------------------------------------------
# 2. FÍSICA: ECUACIONES AUTO-SIMILARES (Euler 3D / Boussinesq Model)
# -------------------------------------------------------------------------
def physics_loss(model, y, lambda_param=0.4713, alpha=2.0, model_stage1=None):
    y.requires_grad = True
    outputs = model(y)
    
    # En Multi-Stage, el segundo modelo aprende el residuo o refinamiento
    if model_stage1 is not None:
        with torch.no_grad():
            outputs_s1 = model_stage1(y)
        Omega = outputs_s1[:, 0:1] + outputs[:, 0:1]
        U = outputs_s1[:, 1:2] + outputs[:, 1:2]
    else:
        Omega = outputs[:, 0:1]
        U = outputs[:, 1:2]
    
    # Derivadas automáticas
    dOmega_dy = torch.autograd.grad(Omega, y, torch.ones_like(Omega), create_graph=True)[0]
    dU_dy = torch.autograd.grad(U, y, torch.ones_like(U), create_graph=True)[0]
    
    # Residuo de Navier-Stokes/Euler auto-similar
    residual = Omega + ((1 + lambda_param) * y - U) * dOmega_dy - Omega * dU_dy
    
    # --- GRADIENT-NORMALIZED RESIDUAL (Wang et al. 2025) ---
    # Usamos detach() para que la normalización no genere gradientes inestables en el denominador
    norm_factor = torch.exp(alpha * torch.abs(Omega.detach()))
    normalized_residual = residual / (norm_factor + 1e-6)
    
    return torch.mean(normalized_residual**2)

# -------------------------------------------------------------------------
# 3. BUCLE DE ENTRENAMIENTO MULTI-STAGE
# -------------------------------------------------------------------------
def train_engine():
    # Stage 1: Aproximación Base
    print("\n📍 ETAPA 1: Buscando perfil base (Baja Resolución)...")
    model_s1 = SingularityNet(hidden_dim=64).to(device)
    opt_s1 = torch.optim.Adam(model_s1.parameters(), lr=1e-3)
    y_phys = torch.linspace(-8, 8, 1000).view(-1, 1).to(device)
    
    for epoch in range(1500):
        opt_s1.zero_grad()
        loss = physics_loss(model_s1, y_phys)
        loss.backward()
        opt_s1.step()
        if epoch % 500 == 0:
            print(f"  > S1 Epoca {epoch}: Loss = {loss.item():.2e}")

    # Stage 2: Refinamiento de Alta Precisión (residual learning)
    print("\n📍 ETAPA 2: Refinamiento de Precisión de Máquina (Captura de señales débiles)...")
    model_s2 = SingularityNet(hidden_dim=128).to(device) # Red más ancha para detalles
    opt_s2 = torch.optim.Adam(model_s2.parameters(), lr=5e-4)
    
    for epoch in range(2000):
        opt_s2.zero_grad()
        loss = physics_loss(model_s2, y_phys, model_stage1=model_s1)
        loss.backward()
        opt_s2.step()
        if epoch % 500 == 0:
            print(f"  > S2 Epoca {epoch}: Loss = {loss.item():.2e}")

    return model_s1, model_s2

# -------------------------------------------------------------------------
# 4. EXPORTACIÓN DE DATOS (Para Frontend Three.js / WebGPU)
# -------------------------------------------------------------------------
def export_results(model_pair):
    m1, m2 = model_pair
    # Generar datos de alta resolución para visualización
    with torch.no_grad():
        y_eval = torch.linspace(-5, 5, 200).view(-1, 1).to(device)
        out1 = m1(y_eval)
        out2 = m2(y_eval)
        omega = (out1[:, 0] + out2[:, 0]).cpu().numpy()
        
        points = []
        for i, y_val in enumerate(y_eval.cpu().numpy().flatten()):
            mag = float(omega[i])
            if abs(mag) > 0.05: 
                points.append({"x": float(y_val), "y": 0, "z": 0, "val": mag})
    
    data = {
        "metadata": {
            "equation": "Euler 3D / CCF Model",
            "method": "Multi-Stage PINN with Gradient-Normalized Residuals",
            "singularity_type": "Unstable (Type II)",
            "lambda_param": 0.4713,
            "reference": "Wang et al., DeepMind (2025/2026)"
        },
        "profile": points 
    }
    
    os.makedirs("src/data", exist_ok=True)
    file_path = "src/data/navier_stokes_singularity.json"
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"💾 Perfil de Refinamiento exportado a: {file_path}")

if __name__ == "__main__":
    start_time = time.time()
    model_pair = train_engine()
    print(f"🏁 Proceso total completado en {time.time() - start_time:.2f}s")
    export_results(model_pair)
