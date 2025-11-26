import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const biasMetrics = [
  { label: "Gender", value: 0.3, safe: 0.5 },
  { label: "Race", value: 0.6, safe: 0.5 },
  { label: "Age", value: 0.4, safe: 0.5 },
  { label: "Culture", value: 0.2, safe: 0.5 },
  { label: "Disability", value: 0.5, safe: 0.5 },
];

export const BiasDemo = () => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const runScan = () => {
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={runScan}
        disabled={scanning}
        className="w-full"
        size="lg"
      >
        {scanning ? "Scanning..." : "Run Safety Scan"}
      </Button>

      <motion.div
        className="relative aspect-square"
        animate={{ opacity: scanned ? 1 : 0.3 }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background grid */}
          {[1, 2, 3, 4, 5].map((ring) => (
            <circle
              key={ring}
              cx="100"
              cy="100"
              r={ring * 18}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {biasMetrics.map((_, index) => {
            const angle = (index * 2 * Math.PI) / biasMetrics.length - Math.PI / 2;
            const x = 100 + Math.cos(angle) * 90;
            const y = 100 + Math.sin(angle) * 90;
            return (
              <line
                key={index}
                x1="100"
                y1="100"
                x2={x}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <motion.polygon
            points={biasMetrics
              .map((metric, index) => {
                const angle = (index * 2 * Math.PI) / biasMetrics.length - Math.PI / 2;
                const distance = metric.value * 90;
                const x = 100 + Math.cos(angle) * distance;
                const y = 100 + Math.sin(angle) * distance;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="hsl(195, 100%, 50%, 0.3)"
            stroke="hsl(195, 100%, 50%)"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: scanned ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Labels */}
          {biasMetrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / biasMetrics.length - Math.PI / 2;
            const x = 100 + Math.cos(angle) * 105;
            const y = 100 + Math.sin(angle) * 105;
            
            return (
              <motion.g key={index} animate={{ opacity: scanning ? [1, 0.3, 1] : 1 }}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                  fontWeight="500"
                >
                  {metric.label}
                </text>
                {scanned && metric.value > metric.safe && (
                  <motion.circle
                    cx={x}
                    cy={y - 15}
                    r="4"
                    fill="hsl(var(--destructive))"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ delay: 0.5 }}
                  />
                )}
              </motion.g>
            );
          })}
        </svg>

        {scanning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full" />
          </motion.div>
        )}
      </motion.div>

      {scanned && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive"
        >
          <p className="text-sm text-foreground">
            <strong>Alert:</strong> Elevated bias detected in Race dimension. Review training data and apply bias-mitigation layers.
          </p>
        </motion.div>
      )}
    </div>
  );
};
