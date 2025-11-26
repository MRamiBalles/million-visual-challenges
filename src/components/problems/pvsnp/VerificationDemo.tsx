import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";

export const VerificationDemo = () => {
  const [userSolution, setUserSolution] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [solving, setSolving] = useState(false);
  const [verifyTime, setVerifyTime] = useState<number | null>(null);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Problema: Factorización de número
  const problem = {
    number: 221,
    correctFactors: [13, 17],
    description: "Encuentra dos números primos que multiplicados den 221"
  };

  const verifySolution = () => {
    setVerifying(true);
    setIsCorrect(null);
    
    // Simular verificación instantánea
    setTimeout(() => {
      const factors = userSolution.split(",").map(n => parseInt(n.trim()));
      const isValid = factors.length === 2 && 
                     factors[0] * factors[1] === problem.number;
      
      setIsCorrect(isValid);
      setVerifyTime(0.001); // Menos de 1ms
      setVerifying(false);
    }, 100);
  };

  const solveProblem = () => {
    setSolving(true);
    setSolveTime(null);
    
    // Simular búsqueda de factores (fuerza bruta)
    const startTime = Date.now();
    let steps = 0;
    
    const interval = setInterval(() => {
      steps += 100;
      
      // Simular encontrar la solución después de varios intentos
      if (steps >= 3000) {
        clearInterval(interval);
        const endTime = Date.now();
        setSolveTime((endTime - startTime) / 1000);
        setUserSolution(`${problem.correctFactors[0]}, ${problem.correctFactors[1]}`);
        setIsCorrect(true);
        setSolving(false);
      }
    }, 100);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Problema */}
        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r">
          <h3 className="font-bold text-xl text-foreground mb-2">Problema del Día:</h3>
          <p className="text-lg text-muted-foreground mb-3">{problem.description}</p>
          <div className="text-3xl font-bold text-primary">
            ? × ? = {problem.number}
          </div>
        </div>

        {/* Dos columnas: Verificar vs Resolver */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* VERIFICAR - FÁCIL (P) */}
          <div className="space-y-4 border-2 border-green-500/30 bg-green-500/5 p-5 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              <h4 className="font-bold text-lg text-foreground">Verificar Solución (Clase P)</h4>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Si alguien te dice "la respuesta es 13 y 17", es <strong>trivial verificar</strong> si es correcta.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tu solución:</label>
              <Input
                placeholder="Ej: 13, 17"
                value={userSolution}
                onChange={(e) => setUserSolution(e.target.value)}
                disabled={verifying}
              />
            </div>

            <Button
              onClick={verifySolution}
              disabled={verifying || !userSolution}
              className="w-full gap-2"
              variant="secondary"
            >
              {verifying ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verificar (instantáneo)
                </>
              )}
            </Button>

            {verifyTime !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between p-3 bg-background rounded">
                  <span className="text-sm font-medium">Tiempo de verificación:</span>
                  <span className="text-lg font-bold text-green-500">{verifyTime}s</span>
                </div>
                
                {isCorrect !== null && (
                  <div className={`flex items-center gap-2 p-3 rounded ${
                    isCorrect ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">¡Correcto! {userSolution.split(",")[0]} × {userSolution.split(",")[1]} = {problem.number}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">Incorrecto. Intenta de nuevo.</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
              <strong>Complejidad:</strong> O(1) - Solo una multiplicación
            </div>
          </div>

          {/* RESOLVER - DIFÍCIL (NP) */}
          <div className="space-y-4 border-2 border-red-500/30 bg-red-500/5 p-5 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <h4 className="font-bold text-lg text-foreground">Encontrar Solución (Clase NP)</h4>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Pero <strong>encontrar</strong> esos números desde cero requiere probar muchas combinaciones.
            </p>

            <div className="bg-background/50 p-4 rounded border border-border">
              <p className="text-sm mb-2 text-muted-foreground">Sin conocer la respuesta, hay que probar:</p>
              <div className="space-y-1 text-xs font-mono text-muted-foreground">
                <div>2 × 110 = 220 ❌</div>
                <div>3 × 73 = 219 ❌</div>
                <div>7 × 31 = 217 ❌</div>
                <div>11 × 20 = 220 ❌</div>
                <div className="text-primary font-bold">13 × 17 = 221 ✓</div>
              </div>
            </div>

            <Button
              onClick={solveProblem}
              disabled={solving}
              className="w-full gap-2"
              variant="destructive"
            >
              {solving ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Resolver (fuerza bruta)
                </>
              )}
            </Button>

            {solveTime !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between p-3 bg-background rounded">
                  <span className="text-sm font-medium">Tiempo de resolución:</span>
                  <span className="text-lg font-bold text-red-500">{solveTime.toFixed(2)}s</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded bg-green-500/10 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Encontrado: {problem.correctFactors[0]} × {problem.correctFactors[1]} = {problem.number}</span>
                </div>
              </motion.div>
            )}

            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
              <strong>Complejidad:</strong> O(√n) - Debe probar hasta √221 ≈ 15 números
            </div>
          </div>
        </div>

        {/* Explicación */}
        <div className="bg-accent/5 border-l-4 border-accent p-6 rounded-r">
          <h4 className="font-bold text-lg text-foreground mb-3">La Pregunta P vs NP</h4>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Este ejemplo ilustra el corazón del problema: <strong>verificar es fácil, resolver es difícil</strong>.
            Con números pequeños como 221, resolver aún es rápido. Pero con números de 300 dígitos (como los que usa RSA), 
            verificar sigue siendo instantáneo pero resolver tomaría <strong>miles de millones de años</strong>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>P vs NP pregunta:</strong> ¿Existe un algoritmo eficiente para <strong>resolver</strong> todos 
            los problemas que son fáciles de <strong>verificar</strong>? Nadie lo sabe.
          </p>
        </div>

        {/* Referencia académica */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-4 rounded">
          <strong>Referencia:</strong> La factorización de números grandes es la base del algoritmo RSA (Rivest-Shamir-Adleman, 1977).
          El problema P vs NP fue formulado formalmente por Stephen Cook en su paper "The complexity of theorem-proving procedures" (1971).
        </div>
      </div>
    </Card>
  );
};