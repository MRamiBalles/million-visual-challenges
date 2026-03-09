import json
import os
import glob
from datetime import datetime

def validate_certificates():
    cert_dir = "d:/million-visual-challenges-2/engines/qap_case_study/certificates/"
    lean_file_path = "d:/million-visual-challenges-2/lean4/VerifiedCertificates.lean"
    
    print(f"--- Pipeline de Verificación Continua MVC (2026) ---")
    
    certificates = glob.glob(os.path.join(cert_dir, "*.json"))
    if not certificates:
        print("Error: No se encontraron certificados para validar.")
        return

    lean_content = [
        "import Certificate\n",
        f"-- Generado automáticamente el {datetime.now().isoformat()}\n",
        "namespace VerifiedCertificates\n"
    ]

    valid_count = 0
    for cert_path in certificates:
        if os.path.basename(cert_path).startswith(('meta_', 'quantum_')):
            continue # Se procesan junto al certificado base
            
        try:
            with open(cert_path, 'r') as f:
                data = json.load(f)
            
            inst = data['metadata']['instance_name']
            inst_id = inst.split('.')[0]
            gap = data['audit_trail']['residual_gap']
            n = data['metadata']['n']
            obs = data['homology_metrics']['cech_obstruction_detected']
            
            # Cargar Meta-Certificado
            meta_path = os.path.join(cert_dir, f"meta_{inst_id}.json")
            meta_effort = 0.0
            if os.path.exists(meta_path):
                with open(meta_path, 'r') as mf:
                    meta_data = json.load(mf)
                    meta_effort = meta_data['meta_metrics']['effort_score']
            
            # Cargar Certificado Cuántico
            quantum_path = os.path.join(cert_dir, f"quantum_{inst_id}.json")
            q_braiding = 0.0
            if os.path.exists(quantum_path):
                with open(quantum_path, 'r') as qf:
                    q_data = json.load(qf)
                    q_braiding = q_data['quantum_metrics']['braiding_index']
            
            if gap > 0 and obs:
                print(f"[VALIDADO] {inst}: GAP={gap}% | META={meta_effort} | Q-BRAID={q_braiding}")
                lean_snippet = f"def cert_{inst_id} : QAPCert := {{ " \
                               f"instance_name := \"{inst}\", n := {n}, " \
                               f"greedy_cost := {data['audit_trail']['greedy_cost']}, " \
                               f"np_best_cost := {data['audit_trail']['np_best_cost']}, " \
                               f"residual_gap := {gap}, betti_1_approx := {data['homology_metrics']['betti_1_approximation']}, " \
                               f"has_obstruction := true, meta_effort := {meta_effort}, " \
                               f"quantum_braiding_index := {q_braiding} }}\n"
                lean_content.append(lean_snippet)
                valid_count += 1
            else:
                print(f"[RECHAZADO] {inst}: No cumple criterios de obstrucción.")
        
        except Exception as e:
            print(f"[ERROR] Procesando {os.path.basename(cert_path)}: {e}")

    lean_content.append("\nend VerifiedCertificates")

    # Escribir el archivo de Lean 4 con los certificados verificados
    with open(lean_file_path, 'w') as f:
        f.writelines(lean_content)
    
    print(f"--------------------------------------------------")
    print(f"PROCESAMIENTO COMPLETADO: {valid_count} certificados formalizados en Lean 4.")
    print(f"Archivo generado: {os.path.basename(lean_file_path)}")

if __name__ == "__main__":
    validate_certificates()
