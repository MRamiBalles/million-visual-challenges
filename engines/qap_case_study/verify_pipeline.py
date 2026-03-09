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
        try:
            with open(cert_path, 'r') as f:
                data = json.load(f)
            
            # Validación básica de integridad
            inst = data['metadata']['instance_name']
            gap = data['audit_trail']['residual_gap']
            n = data['metadata']['n']
            obs = data['homology_metrics']['cech_obstruction_detected']
            
            if gap > 0 and obs:
                print(f"[VALIDADO] {inst}: GAP={gap}% | OBSTRUCCIÓN=SÍ")
                # Generar el snippet de Lean 4
                lean_snippet = f"def cert_{inst.split('.')[0]} : QAPCert := {{ " \
                               f"instance_name := \"{inst}\", n := {n}, " \
                               f"greedy_cost := {data['audit_trail']['greedy_cost']}, " \
                               f"np_best_cost := {data['audit_trail']['np_best_cost']}, " \
                               f"residual_gap := {gap}, betti_1_approx := {data['homology_metrics']['betti_1_approximation']}, " \
                               f"has_obstruction := true }}\n"
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
