import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

// Approximation of Riemann Zeta function for visualization purposes
const zetaApprox = (s: { re: number; im: number }, terms: number = 50): { re: number; im: number } => {
  let sumRe = 0;
  let sumIm = 0;

  for (let n = 1; n <= terms; n++) {
    const nPowS = Math.pow(n, -s.re);
    const angle = -s.im * Math.log(n);
    sumRe += nPowS * Math.cos(angle);
    sumIm += nPowS * Math.sin(angle);
  }

  return { re: sumRe, im: sumIm };
};

const magnitude = (z: { re: number; im: number }): number => {
  return Math.sqrt(z.re * z.re + z.im * z.im);
};

export const ZetaFunctionVisualization = () => {
  const [realPart, setRealPart] = useState([0.5]);
  const [imagPart, setImagPart] = useState([14.13]);

  const s = { re: realPart[0], im: imagPart[0] };
  const zetaValue = zetaApprox(s, 100);
  const mag = magnitude(zetaValue);

  // Generate heatmap data
  const resolution = 40;
  const heatmapData: number[][] = [];
  
  for (let y = 0; y < resolution; y++) {
    const row: number[] = [];
    for (let x = 0; x < resolution; x++) {
      const re = (x / resolution) * 2 - 0.5; // Range: -0.5 to 1.5
      const im = (y / resolution) * 60 - 30; // Range: -30 to 30
      const val = zetaApprox({ re, im }, 30);
      row.push(magnitude(val));
    }
    heatmapData.push(row);
  }

  const maxMag = Math.max(...heatmapData.flat());

  // Get color based on magnitude
  const getColor = (mag: number): string => {
    const normalized = Math.min(mag / maxMag, 1);
    if (normalized < 0.1) return "hsl(280, 100%, 70%)"; // Purple (near zero)
    if (normalized < 0.3) return "hsl(195, 100%, 50%)"; // Blue
    if (normalized < 0.6) return "hsl(120, 60%, 50%)"; // Green
    return "hsl(30, 100%, 60%)"; // Orange/Red (high)
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Parte Real σ</div>
            <div className="text-2xl font-bold text-foreground">{s.re.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Parte Imaginaria t</div>
            <div className="text-2xl font-bold text-foreground">{s.im.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">|ζ(s)|</div>
            <div className={`text-2xl font-bold ${mag < 0.5 ? "text-primary" : "text-foreground"}`}>
              {mag.toFixed(3)}
            </div>
          </div>
        </div>

        {mag < 0.5 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary/10 border-l-4 border-primary p-3 rounded-r"
          >
            <p className="text-sm font-semibold text-primary">
              ⭐ ¡Cerca de un cero! Todos los ceros no triviales verificados tienen σ = 0.5
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-foreground">Parte Real (σ)</label>
              <Badge variant={s.re === 0.5 ? "default" : "secondary"}>
                {s.re === 0.5 ? "Línea Crítica" : "Fuera de línea"}
              </Badge>
            </div>
            <Slider
              value={realPart}
              onValueChange={setRealPart}
              min={-0.5}
              max={1.5}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Parte Imaginaria (t)</label>
            <Slider
              value={imagPart}
              onValueChange={setImagPart}
              min={0}
              max={50}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* Heatmap visualization */}
        <div className="relative w-full bg-muted/20 rounded-lg overflow-hidden border border-border">
          <svg className="w-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            {/* Heatmap */}
            {heatmapData.map((row, y) =>
              row.map((val, x) => {
                const cellWidth = 800 / resolution;
                const cellHeight = 600 / resolution;
                return (
                  <rect
                    key={`${x}-${y}`}
                    x={x * cellWidth}
                    y={y * cellHeight}
                    width={cellWidth}
                    height={cellHeight}
                    fill={getColor(val)}
                    opacity={0.6}
                  />
                );
              })
            )}

            {/* Critical line (σ = 0.5) */}
            <line
              x1={(0.5 + 0.5) / 2 * 800}
              y1="0"
              x2={(0.5 + 0.5) / 2 * 800}
              y2="600"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray="10,5"
            />

            {/* Current point */}
            <motion.circle
              cx={(s.re + 0.5) / 2 * 800}
              cy={(s.im + 30) / 60 * 600}
              r="10"
              fill="hsl(var(--foreground))"
              stroke="hsl(var(--background))"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            />

            {/* Axes labels */}
            <text x="10" y="20" fill="hsl(var(--foreground))" fontSize="14">t = 30</text>
            <text x="10" y="590" fill="hsl(var(--foreground))" fontSize="14">t = -30</text>
            <text x="10" y="310" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">t = 0</text>
            
            <text x="20" y="590" fill="hsl(var(--foreground))" fontSize="14">σ = -0.5</text>
            <text x="720" y="590" fill="hsl(var(--foreground))" fontSize="14">σ = 1.5</text>
            <text x={((0.5 + 0.5) / 2 * 800) - 30} y="590" fill="hsl(var(--primary))" fontSize="14" fontWeight="bold">σ = 0.5</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-foreground text-sm">Mapa de Calor de |ζ(σ + it)|</h4>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(280, 100%, 70%)" }} />
              <span className="text-muted-foreground">Cerca de cero</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(195, 100%, 50%)" }} />
              <span className="text-muted-foreground">Bajo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120, 60%, 50%)" }} />
              <span className="text-muted-foreground">Medio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(30, 100%, 60%)" }} />
              <span className="text-muted-foreground">Alto</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border">
            Los puntos morados oscuros son los <strong>ceros de ζ(s)</strong>. La línea vertical punteada es la 
            "línea crítica" σ = 1/2. La Hipótesis de Riemann afirma que todos los ceros no triviales están 
            exactamente en esta línea.
          </p>
        </div>

        {/* Known zeros */}
        <div className="bg-accent/5 p-4 rounded-lg">
          <h4 className="font-semibold text-foreground text-sm mb-2">Primeros Ceros No Triviales (t)</h4>
          <div className="flex gap-2 flex-wrap">
            {[14.13, 21.02, 25.01, 30.42, 32.93, 37.58, 40.91, 43.32].map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => {
                  setRealPart([0.5]);
                  setImagPart([t]);
                }}
              >
                {t}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Haz clic en cualquier valor para explorar ese cero. Todos tienen σ = 0.5.
          </p>
        </div>
      </div>
    </Card>
  );
};