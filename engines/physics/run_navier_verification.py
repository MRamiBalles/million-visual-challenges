import json
import os
import sys
from pathlib import Path

# Añadir el directorio de motores al path para importar el solver
sys.path.append(str(Path("d:/million-visual-challenges-2/engines/physics")))
from navier_stokes_rigor import NavierStokesIntervalSolver

def main():
    data_path = "d:/million-visual-challenges-2/src/data/navier_stokes_singularity_refined.json"
    
    if not os.path.exists(data_path):
        print(f"Error: No se encontró el archivo de datos en {data_path}")
        return

    with open(data_path, "r") as f:
        data = json.load(f)
    
    metadata = data.get("metadata", {})
    profile = data.get("profile", [])
    
    y = [p["y_coord"] for p in profile]
    omega = [p["vorticity"] for p in profile]
    lambda_val = metadata.get("lambda_param", 0.4713)
    
    print(f"🔬 Iniciando Validación de Rigor: Navier-Stokes")
    print(f"   Perfil: {metadata.get('description')}")
    print(f"   Lambda: {lambda_val}")
    print(f"   Puntos de Control: {len(y)}")
    
    solver = NavierStokesIntervalSolver(lambda_val=lambda_val)
    certificate = solver.verify_profile({"y": y, "Omega": omega})
    
    print("\n📜 CERTIFICADO DE RIGOR EMITIDO:")
    print(json.dumps(certificate, indent=4))
    
    # Guardar el certificado oficial
    cert_path = "d:/million-visual-challenges-2/docs/navier_stokes/certificado_rigor_navier.json"
    with open(cert_path, "w") as f:
        json.dump({
            "audit_target": "Navier-Stokes Blow-up Profile",
            "data_source": data_path,
            "verification_results": certificate
        }, f, indent=4)
        
    print(f"\n✅ Certificado guardado en: {cert_path}")

if __name__ == "__main__":
    main()
