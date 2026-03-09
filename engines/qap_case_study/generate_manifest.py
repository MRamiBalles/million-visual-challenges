import json
import os
import glob
from datetime import datetime

def generate_sovereign_manifest():
    """
    Consolida todos los certificados (Base, Meta, Quantum) en un único manifiesto
    para que el frontend consuma datos reales y dinámicos.
    """
    cert_dir = "d:/million-visual-challenges-2/engines/qap_case_study/certificates/"
    manifest_path = "d:/million-visual-challenges-2/public/data/sovereign_manifest.json"
    
    # Asegurar que el directorio de datos existe
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    
    manifest = {
        "metadata": {
            "version": "2026.1.0",
            "last_updated": datetime.now().isoformat(),
            "sovereignty_level": "TOTAL"
        },
        "certificates": {}
    }
    
    # Buscar certificados base
    base_certs = glob.glob(os.path.join(cert_dir, "cert_*.json"))
    
    for cert_path in base_certs:
        with open(cert_path, 'r') as f:
            base_data = json.load(f)
            
        inst_id = base_data['metadata']['instance_name'].split('.')[0]
        
        # Cargar extensiones (Meta y Quantum)
        meta_path = os.path.join(cert_dir, f"meta_{inst_id}.json")
        quantum_path = os.path.join(cert_dir, f"quantum_{inst_id}.json")
        
        meta_data = {}
        if os.path.exists(meta_path):
            with open(meta_path, 'r') as mf:
                meta_data = json.load(mf).get('meta_metrics', {})
                
        quantum_data = {}
        if os.path.exists(quantum_path):
            with open(quantum_path, 'r') as qf:
                quantum_data = json.load(qf).get('quantum_metrics', {})
        
        manifest["certificates"][inst_id] = {
            "instance": inst_id,
            "base": {
                "gap": base_data['audit_trail']['residual_gap'],
                "betti": base_data['homology_metrics']['betti_1_approximation'],
                "obstructed": base_data['homology_metrics']['cech_obstruction_detected']
            },
            "meta": meta_data,
            "quantum": quantum_data
        }
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=4)
        
    print(f"[SOVEREIGN] Manifiesto generado en: {manifest_path}")

if __name__ == "__main__":
    generate_sovereign_manifest()
