import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

type State = "q0" | "q1" | "q2" | "qAccept" | "qReject";
type Symbol = "0" | "1" | "B"; // B = Blank

interface TapeCell {
  value: Symbol;
  index: number;
}

export const TuringMachineDemo = () => {
  const [tape, setTape] = useState<TapeCell[]>([
    { value: "1", index: 0 },
    { value: "0", index: 1 },
    { value: "1", index: 2 },
    { value: "1", index: 3 },
    { value: "B", index: 4 },
    { value: "B", index: 5 },
  ]);
  const [headPosition, setHeadPosition] = useState(0);
  const [currentState, setCurrentState] = useState<State>("q0");
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);

  const step = () => {
    if (currentState === "qAccept" || currentState === "qReject") {
      setIsRunning(false);
      return;
    }

    const currentSymbol = tape[headPosition]?.value || "B";
    
    // Simple Turing Machine: checks if binary number is even (ends in 0)
    if (currentState === "q0") {
      if (currentSymbol === "0" || currentSymbol === "1") {
        // Move right until we find the last digit
        setHeadPosition((pos) => pos + 1);
        setSteps((s) => s + 1);
      } else if (currentSymbol === "B") {
        // We've gone past the number, go back
        setHeadPosition((pos) => pos - 1);
        setCurrentState("q1");
        setSteps((s) => s + 1);
      }
    } else if (currentState === "q1") {
      if (currentSymbol === "0") {
        setCurrentState("qAccept");
      } else if (currentSymbol === "1") {
        setCurrentState("qReject");
      }
      setSteps((s) => s + 1);
    }
  };

  const reset = () => {
    setTape([
      { value: "1", index: 0 },
      { value: "0", index: 1 },
      { value: "1", index: 2 },
      { value: "1", index: 3 },
      { value: "B", index: 4 },
      { value: "B", index: 5 },
    ]);
    setHeadPosition(0);
    setCurrentState("q0");
    setSteps(0);
    setIsRunning(false);
  };

  const toggleRun = () => {
    if (currentState === "qAccept" || currentState === "qReject") {
      reset();
    } else {
      setIsRunning(!isRunning);
    }
  };

  // Auto-step when running
  if (isRunning && currentState !== "qAccept" && currentState !== "qReject") {
    setTimeout(step, 500);
  }

  const getStateColor = (state: State) => {
    switch (state) {
      case "qAccept":
        return "hsl(120, 60%, 50%)";
      case "qReject":
        return "hsl(0, 100%, 60%)";
      default:
        return "hsl(195, 100%, 50%)";
    }
  };

  const getStateLabel = (state: State) => {
    switch (state) {
      case "q0":
        return "Buscando fin";
      case "q1":
        return "Verificando último dígito";
      case "qAccept":
        return "✓ ES PAR";
      case "qReject":
        return "✗ ES IMPAR";
      default:
        return state;
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Estado Actual</div>
            <div
              className="text-xl font-bold px-3 py-1 rounded inline-block"
              style={{
                backgroundColor: `${getStateColor(currentState)}20`,
                color: getStateColor(currentState),
              }}
            >
              {getStateLabel(currentState)}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Pasos Ejecutados</div>
            <div className="text-2xl font-bold text-foreground">{steps}</div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={toggleRun} className="gap-2">
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {currentState === "qAccept" || currentState === "qReject" ? "Reiniciar" : "Ejecutar"}
              </>
            )}
          </Button>

          <Button onClick={step} disabled={isRunning || currentState === "qAccept" || currentState === "qReject"} variant="secondary" className="gap-2">
            <FastForward className="w-4 h-4" />
            Un Paso
          </Button>

          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </Button>
        </div>

        {/* Tape Visualization */}
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-1 min-w-max justify-center">
              <AnimatePresence>
                {tape.map((cell, index) => (
                  <motion.div
                    key={cell.index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <div
                      className={`w-16 h-16 border-2 flex items-center justify-center text-2xl font-bold rounded transition-all ${
                        headPosition === index
                          ? "border-primary bg-primary/20 scale-110"
                          : "border-border bg-muted/10"
                      }`}
                    >
                      {cell.value}
                    </div>
                    
                    {headPosition === index && (
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-primary font-bold text-sm whitespace-nowrap"
                      >
                        ▼ CABEZA
                      </motion.div>
                    )}

                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                      {index}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-foreground">¿Qué hace esta Máquina de Turing?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta máquina verifica si un número binario es <strong>par</strong> (termina en 0).
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-primary font-semibold">q0:</span>
              <span className="text-muted-foreground">Se mueve a la derecha buscando el fin del número</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">q1:</span>
              <span className="text-muted-foreground">Verifica el último dígito (0=par, 1=impar)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-semibold">qAccept:</span>
              <span className="text-muted-foreground">El número es par</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-600 font-semibold">qReject:</span>
              <span className="text-muted-foreground">El número es impar</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pt-2 border-t border-border">
            <strong>Nota:</strong> Los problemas P y NP se definen formalmente usando Máquinas de Turing.
            P = problemas que una MT determinística resuelve en tiempo polinomial.
            NP = problemas que una MT no-determinística resuelve en tiempo polinomial.
          </p>
        </div>
      </div>
    </Card>
  );
};
