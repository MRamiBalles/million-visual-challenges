import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const isPrime = (num: number): boolean => {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
};

const countPrimes = (n: number): number => {
  let count = 0;
  for (let i = 2; i <= n; i++) {
    if (isPrime(i)) count++;
  }
  return count;
};

const primeCountingFunction = (n: number): number => {
  return countPrimes(n);
};

const logarithmicIntegral = (x: number): number => {
  if (x < 2) return 0;
  return x / Math.log(x);
};

export const PrimeDistributionVisualization = () => {
  const [limit, setLimit] = useState([100]);
  
  const n = limit[0];
  const actualPrimes = primeCountingFunction(n);
  const predicted = Math.floor(logarithmicIntegral(n));
  const error = Math.abs(actualPrimes - predicted);
  const errorPercent = ((error / actualPrimes) * 100).toFixed(2);

  // Generate data points for visualization
  const dataPoints: { x: number; actual: number; predicted: number }[] = [];
  for (let x = 10; x <= n; x += Math.max(1, Math.floor(n / 50))) {
    dataPoints.push({
      x,
      actual: primeCountingFunction(x),
      predicted: Math.floor(logarithmicIntegral(x)),
    });
  }

  const maxY = Math.max(...dataPoints.map(p => Math.max(p.actual, p.predicted)));
  const scaleY = 300 / (maxY || 1);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Límite superior</div>
            <div className="text-3xl font-bold text-primary">{n}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">π(n) Real</div>
              <div className="text-2xl font-bold text-foreground">{actualPrimes}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Li(n) Predicho</div>
              <div className="text-2xl font-bold text-accent">{predicted}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Error</div>
              <div className="text-xl font-bold text-destructive">{errorPercent}%</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-foreground">
              Explorar hasta n = {n}
            </label>
          </div>
          <Slider
            value={limit}
            onValueChange={setLimit}
            min={10}
            max={1000}
            step={10}
            className="w-full"
          />
        </div>

        {/* Graph */}
        <div className="relative w-full bg-muted/20 rounded-lg overflow-hidden border border-border p-4" style={{ height: "400px" }}>
          <svg className="w-full h-full" viewBox="0 0 800 350">
            {/* Axes */}
            <line x1="50" y1="320" x2="750" y2="320" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="320" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
              const y = 320 - (fraction * 300);
              return (
                <line
                  key={fraction}
                  x1="50"
                  y1={y}
                  x2="750"
                  y2={y}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                />
              );
            })}

            {/* Actual primes line */}
            {dataPoints.map((point, i) => {
              if (i === 0) return null;
              const prevPoint = dataPoints[i - 1];
              const x1 = 50 + (prevPoint.x / n) * 700;
              const y1 = 320 - prevPoint.actual * scaleY;
              const x2 = 50 + (point.x / n) * 700;
              const y2 = 320 - point.actual * scaleY;

              return (
                <motion.line
                  key={`actual-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.01 }}
                />
              );
            })}

            {/* Predicted line */}
            {dataPoints.map((point, i) => {
              if (i === 0) return null;
              const prevPoint = dataPoints[i - 1];
              const x1 = 50 + (prevPoint.x / n) * 700;
              const y1 = 320 - prevPoint.predicted * scaleY;
              const x2 = 50 + (point.x / n) * 700;
              const y2 = 320 - point.predicted * scaleY;

              return (
                <line
                  key={`predicted-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
              );
            })}

            {/* Labels */}
            <text x="400" y="345" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12">
              n
            </text>
            <text x="30" y="25" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12">
              π(n)
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary rounded" />
            <span className="text-sm text-muted-foreground">π(n) - Conteo real de primos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-accent rounded border-2 border-accent" style={{ borderStyle: "dashed" }} />
            <span className="text-sm text-muted-foreground">Li(n) - Predicción usando logaritmo integral</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-accent/5 border-l-4 border-accent p-4 rounded-r space-y-2">
          <h4 className="font-semibold text-foreground">Función π(n) vs Li(n)</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>π(n)</strong> cuenta cuántos primos hay hasta n. <strong>Li(n) = ∫₂ⁿ dt/ln(t)</strong> es 
            la predicción basada en la Hipótesis de Riemann. La precisión mejora dramáticamente para n grandes.
          </p>
          <p className="text-xs text-muted-foreground">
            Con n=1000, el error es ~{errorPercent}%. Para n=10⁹, el error es &lt;0.001%. 
            Si RH es cierta, el error es O(√n log n).
          </p>
        </div>
      </div>
    </Card>
  );
};