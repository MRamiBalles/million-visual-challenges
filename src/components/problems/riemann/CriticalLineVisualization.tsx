import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// First 20 known non-trivial zeros (imaginary parts)
const knownZeros = [
  14.134725, 21.022040, 25.010858, 30.424876, 32.935062,
  37.586178, 40.918719, 43.327073, 48.005151, 49.773832,
  52.970321, 56.446248, 59.347044, 60.831779, 65.112544,
  67.079811, 69.546402, 72.067158, 75.704691, 77.144840
];

export const CriticalLineVisualization = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLabels, setShowLabels] = useState(true);

  const zoomIn = () => setZoomLevel(Math.min(zoomLevel * 1.5, 5));
  const zoomOut = () => setZoomLevel(Math.max(zoomLevel / 1.5, 0.5));
  const reset = () => setZoomLevel(1);

  const viewHeight = 100 / zoomLevel;
  const viewStart = 0;
  const viewEnd = viewStart + viewHeight;

  const visibleZeros = knownZeros.filter(z => z >= viewStart && z <= viewEnd);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Primeros 20 Ceros No Triviales</h3>
            <p className="text-sm text-muted-foreground">
              Todos verificados en la línea crítica Re(s) = 1/2
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={zoomIn} size="sm" variant="outline" className="gap-2">
              <ZoomIn className="w-4 h-4" />
              Acercar
            </Button>
            <Button onClick={zoomOut} size="sm" variant="outline" className="gap-2">
              <ZoomOut className="w-4 h-4" />
              Alejar
            </Button>
            <Button onClick={reset} size="sm" variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowLabels(!showLabels)}
            size="sm"
            variant={showLabels ? "default" : "outline"}
          >
            {showLabels ? "Ocultar" : "Mostrar"} valores
          </Button>
          <Badge variant="secondary">Zoom: {zoomLevel.toFixed(1)}x</Badge>
          <Badge variant="outline">{visibleZeros.length} ceros visibles</Badge>
        </div>

        {/* Complex plane visualization */}
        <div className="relative w-full bg-muted/10 rounded-lg border border-border p-6" style={{ minHeight: "500px" }}>
          <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            {/* Grid */}
            {[...Array(11)].map((_, i) => {
              const x = 80 + (i * 64);
              return (
                <line
                  key={`v-grid-${i}`}
                  x1={x}
                  y1="50"
                  x2={x}
                  y2="550"
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              );
            })}
            {[...Array(11)].map((_, i) => {
              const y = 50 + (i * 50);
              return (
                <line
                  key={`h-grid-${i}`}
                  x1="80"
                  y1={y}
                  x2="720"
                  y2={y}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axes */}
            <line x1="80" y1="50" x2="80" y2="550" stroke="hsl(var(--foreground))" strokeWidth="2" />
            <line x1="80" y1="300" x2="720" y2="300" stroke="hsl(var(--foreground))" strokeWidth="2" />

            {/* Critical line σ = 0.5 */}
            <line
              x1="400"
              y1="50"
              x2="400"
              y2="550"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeDasharray="10,5"
            />

            {/* Axis labels */}
            <text x="40" y="55" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">Im(s)</text>
            <text x="700" y="295" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">Re(s)</text>
            
            <text x="75" y="315" fill="hsl(var(--foreground))" fontSize="12" textAnchor="end">0</text>
            <text x="75" y="65" fill="hsl(var(--foreground))" fontSize="12" textAnchor="end">{viewEnd.toFixed(0)}</text>
            <text x="75" y="565" fill="hsl(var(--foreground))" fontSize="12" textAnchor="end">{viewStart.toFixed(0)}</text>

            <text x="80" y="320" fill="hsl(var(--foreground))" fontSize="12" textAnchor="middle">0</text>
            <text x="240" y="320" fill="hsl(var(--foreground))" fontSize="12" textAnchor="middle">0.25</text>
            <text x="400" y="320" fill="hsl(var(--primary))" fontSize="12" textAnchor="middle" fontWeight="bold">0.5</text>
            <text x="560" y="320" fill="hsl(var(--foreground))" fontSize="12" textAnchor="middle">0.75</text>
            <text x="720" y="320" fill="hsl(var(--foreground))" fontSize="12" textAnchor="middle">1</text>

            {/* Plot zeros */}
            {visibleZeros.map((zero, index) => {
              const y = 550 - ((zero - viewStart) / viewHeight) * 500;
              const x = 400; // All on critical line

              return (
                <g key={zero}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                  />
                  
                  {showLabels && (
                    <motion.text
                      x={x + 15}
                      y={y + 5}
                      fill="hsl(var(--foreground))"
                      fontSize="11"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                    >
                      {zero.toFixed(2)}i
                    </motion.text>
                  )}

                  {/* Pulse animation for emphasis */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                </g>
              );
            })}

            {/* Critical line label */}
            <motion.text
              x="410"
              y="70"
              fill="hsl(var(--primary))"
              fontSize="14"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Línea Crítica
            </motion.text>
            <motion.text
              x="410"
              y="88"
              fill="hsl(var(--primary))"
              fontSize="12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Re(s) = 1/2
            </motion.text>
          </svg>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Conocidos</div>
            <div className="text-3xl font-bold text-primary">10¹³+</div>
            <div className="text-xs text-muted-foreground mt-1">Ceros verificados computacionalmente</div>
          </Card>

          <Card className="p-4 bg-accent/5 border-accent/20">
            <div className="text-sm text-muted-foreground mb-1">Todos en σ = 1/2</div>
            <div className="text-3xl font-bold text-accent">100%</div>
            <div className="text-xs text-muted-foreground mt-1">Ninguna excepción encontrada</div>
          </Card>

          <Card className="p-4 bg-muted/30 border-border">
            <div className="text-sm text-muted-foreground mb-1">Estado</div>
            <div className="text-2xl font-bold text-destructive">Sin demostrar</div>
            <div className="text-xs text-muted-foreground mt-1">Problema abierto desde 1859</div>
          </Card>
        </div>

        {/* Information box */}
        <div className="bg-accent/5 border-l-4 border-accent p-4 rounded-r space-y-3">
          <h4 className="font-semibold text-foreground">Interpretación del Gráfico</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cada punto representa un <strong>cero no trivial</strong> de la función zeta: un número complejo 
            s = σ + it donde ζ(s) = 0. La línea vertical punteada es la "línea crítica" donde σ = 1/2.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>La Hipótesis de Riemann</strong> afirma que <em>todos</em> los infinitos ceros no triviales 
            están exactamente en esta línea. Se han verificado más de 10 billones y <strong>todos</strong> están 
            en σ = 1/2, pero nadie ha podido demostrarlo para todos.
          </p>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Los "ceros triviales" están en s = -2, -4, -6, ... y son bien entendidos.
              Los "no triviales" son los misteriosos y están relacionados con la distribución de números primos.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};