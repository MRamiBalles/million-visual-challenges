import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export const ComplexityGraph = () => {
  const [n, setN] = useState([10]);

  const complexities = [
    { name: "O(1)", fn: () => 1, color: "hsl(120, 60%, 50%)", label: "Constante" },
    { name: "O(log n)", fn: (x: number) => Math.log2(x), color: "hsl(195, 100%, 50%)", label: "Logarítmico" },
    { name: "O(n)", fn: (x: number) => x, color: "hsl(280, 100%, 70%)", label: "Lineal" },
    { name: "O(n log n)", fn: (x: number) => x * Math.log2(x), color: "hsl(30, 100%, 60%)", label: "Lineal-logarítmico" },
    { name: "O(n²)", fn: (x: number) => x * x, color: "hsl(340, 100%, 65%)", label: "Cuadrático" },
    { name: "O(2ⁿ)", fn: (x: number) => Math.pow(2, x), color: "hsl(0, 100%, 60%)", label: "Exponencial" },
  ];

  const maxValue = Math.max(...complexities.map(c => c.fn(n[0])));
  const scale = 300 / (maxValue || 1);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-foreground">Tamaño del problema (n)</label>
            <span className="text-2xl font-bold text-primary">{n[0]}</span>
          </div>
          <Slider
            value={n}
            onValueChange={setN}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Bar Chart */}
        <div className="space-y-3">
          {complexities.map((complexity, index) => {
            const value = complexity.fn(n[0]);
            const width = Math.min((value * scale / 300) * 100, 100);
            const isExponential = complexity.name === "O(2ⁿ)";
            
            return (
              <motion.div
                key={complexity.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: complexity.color }}
                    />
                    <span className="font-mono font-bold text-foreground">{complexity.name}</span>
                  </div>
                  <span className="text-muted-foreground">{complexity.label}</span>
                  <span className="font-bold text-foreground min-w-[80px] text-right">
                    {value < 1000 ? value.toFixed(0) : value.toExponential(2)}
                  </span>
                </div>
                
                <div className="h-8 bg-muted/20 rounded-lg overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-lg"
                    style={{ backgroundColor: complexity.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {isExponential && n[0] > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-lg">
                        ¡INTRATABLE!
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Clase P (Eficiente)
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
              <li>• O(1), O(log n), O(n), O(n log n), O(n²)</li>
              <li>• Tiempo crece "razonablemente"</li>
              <li>• Resoluble en práctica</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Fuera de P (Intratable)
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
              <li>• O(2ⁿ), O(n!), O(nⁿ)</li>
              <li>• Crece explosivamente</li>
              <li>• Imposible con n grande</li>
            </ul>
          </div>
        </div>

        <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r">
          <p className="text-sm text-foreground">
            <strong>Ejemplo:</strong> Con n=20, un algoritmo O(2ⁿ) necesitaría revisar{" "}
            <strong>1,048,576</strong> posibilidades. Con n=30: <strong>1 billón</strong>.
            Con n=60: más que átomos en el universo observable.
          </p>
        </div>
      </div>
    </Card>
  );
};
