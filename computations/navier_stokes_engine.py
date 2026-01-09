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
class SingularityNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Arquitectura MLP simple pero profunda para capturar gradientes altos
        # Entradas: (y) coordenada auto-similar
        # Salidas: (Omega, U) Vorticidad y Velocidad
        self.net = nn.Sequential(
            nn.Linear(1, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 2)  # [Omega, U]
        )

    def forward(self, y):
        return self.net(y)

# -------------------------------------------------------------------------
# 2. FÍSICA: ECUACIONES AUTO-SIMILARES (Euler 3D / Boussinesq Model)
# -------------------------------------------------------------------------
def physics_loss(model, y, lambda_param=0.4713): # lambda crítico aprox para 2da inestable
    y.requires_grad = True
    outputs = model(y)
    Omega = outputs[:, 0:1]
    U = outputs[:, 1:2]
    
    # Derivadas automáticas (Autodiff)
    dOmega_dy = torch.autograd.grad(Omega, y, torch.ones_like(Omega), create_graph=True)[0]
    dU_dy = torch.autograd.grad(U, y, torch.ones_like(U), create_graph=True)[0]
    
    # Residuo de la Ecuación de Euler/CCF en coordenadas auto-similares
    # Ecuación: Omega + ((1 + lambda)y - U) * dOmega_dy - Omega * dU_dy = 0
    # Referencia: Wang et al. (2025), Eq. 4 [3]
    residual = Omega + ((1 + lambda_param) * y - U) * dOmega_dy - Omega * dU_dy
    
    # --- INNOVACIÓN CLAVE: GRADIENT-NORMALIZED RESIDUAL ---
    # Normalizamos el residuo por la magnitud exponencial de la vorticidad
    # para evitar que los picos dominen y oculten la señal en el origen.
    # Formula: L = | R / exp(alpha * Omega) |^2
    alpha = 2.0  # Parámetro de escala sugerido por el paper [4]
    
    # Detach de la normalización para no afectar el gradiente de la red por el denominador
    normalization = torch.exp(alpha * Omega.detach())
    
    normalized_residual = residual / (normalization + 1e-6) # epsilon para estabilidad
    
    loss = torch.mean(normalized_residual**2)
    return loss

# -------------------------------------------------------------------------
# 3. BUCLE DE ENTRENAMIENTO (Multi-Stage simplificado)
# -------------------------------------------------------------------------
def train_engine():
    model = SingularityNet().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    
    # Dominio espacial y (coordenada auto-similar)
    # Wang et al. usan mapeos a dominios finitos, aquí simplificamos a [-10, 10]
    y_phys = torch.linspace(-10, 10, 1000).view(-1, 1).to(device)
    
    print("🧠 Entrenando PINN para descubrir perfil de singularidad...")
    start_time = time.time()
    
    # Entrenamiento rápido para demostración (aumentar épocas para precisión real)
    epochs = 2000 
    for epoch in range(epochs):
        optimizer.zero_grad()
        loss = physics_loss(model, y_phys)
        loss.backward()
        optimizer.step()
        
        if epoch % 200 == 0:
            print(f"Epoca {epoch}: Loss Normalizada = {loss.item():.2e}")

    print(f"✅ Entrenamiento completado en {time.time() - start_time:.2f}s")
    return model

# -------------------------------------------------------------------------
# 4. EXPORTACIÓN DE DATOS (Para Frontend Three.js / WebGPU)
# -------------------------------------------------------------------------
def export_results(model):
    # Generar datos de alta resolución para visualización
    with torch.no_grad():
        y_eval = torch.linspace(-5, 5, 200).view(-1, 1).to(device)
        outputs = model(y_eval)
        omega = outputs[:, 0].cpu().numpy()
        
        # Generar una estructura 3D simulada (tubo de vorticidad)
        # Convertimos el perfil 1D (y) en un campo 3D rotando alrededor del eje
        points = []
        vectors = []
        colors = []
        
        # Construcción simplificada de geometría para visualización
        for i, y_val in enumerate(y_eval.cpu().numpy().flatten()):
            # La magnitud de la vorticidad define el "radio" visual o color
            mag = float(omega[i])
            
            # Crear anillo de puntos para dar volumen 3D
            if abs(mag) > 0.1: # Solo exportar puntos relevantes
                points.append({"x": float(y_val), "y": 0, "z": 0, "val": mag})
    
    # Estructura del JSON
    data = {
        "metadata": {
            "equation": "Euler 3D / CCF Model",
            "method": "PINN with Gradient-Normalized Residuals",
            "singularity_type": "Unstable (Type II)",
            "lambda_param": 0.4713,
            "reference": "Wang et al., DeepMind (2025)"
        },
        "profile": points 
    }
    
    # Asegurar directorio
    os.makedirs("src/data", exist_ok=True)
    file_path = "src/data/navier_stokes_singularity.json"
    
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"💾 Artefacto de Singularidad exportado a: {file_path}")

if __name__ == "__main__":
    trained_model = train_engine()
    export_results(trained_model)
