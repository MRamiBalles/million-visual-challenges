import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Cpu, HardDrive, Clock } from "lucide-react";

export const ScalabilityDemo = () => {
  const [scale, setScale] = useState([1]);

  const scaleValue = Math.pow(10, scale[0]);
  const memoryUsage = Math.min(100, (scaleValue / 10000) * 100);
  const latency = Math.min(5000, (scaleValue / 200) * 100);
  const cpuUsage = Math.min(100, (scaleValue / 5000) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-foreground">Scale</h3>
          <span className="text-primary font-bold">
            {scaleValue >= 1000000 ? "1M" : scaleValue >= 1000 ? `${(scaleValue / 1000).toFixed(0)}K` : scaleValue}
          </span>
        </div>
        <Slider
          value={scale}
          onValueChange={setScale}
          max={6}
          min={0}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <ResourceBar
          icon={HardDrive}
          label="Memory"
          value={memoryUsage}
          unit="GB"
          color="hsl(195, 100%, 50%)"
        />
        <ResourceBar
          icon={Cpu}
          label="CPU"
          value={cpuUsage}
          unit="%"
          color="hsl(30, 100%, 60%)"
        />
        <ResourceBar
          icon={Clock}
          label="Latency"
          value={latency / 50}
          unit="ms"
          displayValue={latency}
          color="hsl(280, 100%, 70%)"
        />
      </div>

      <motion.div
        className="p-4 rounded-lg border-2"
        animate={{
          borderColor: scaleValue > 100000 ? "hsl(var(--destructive))" : "hsl(var(--border))",
          backgroundColor: scaleValue > 100000 ? "hsl(var(--destructive), 0.1)" : "hsl(var(--card))",
        }}
      >
        <p className="text-sm text-foreground">
          {scaleValue < 1000 && "✅ Optimal performance - resources well within limits."}
          {scaleValue >= 1000 && scaleValue < 100000 && "⚠️ Moderate load - consider chunking prompts and reusing memory-tokens."}
          {scaleValue >= 100000 && "🚨 High load - deploy region-specific presets and optimize batch processing."}
        </p>
      </motion.div>
    </div>
  );
};

const ResourceBar = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  displayValue, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  unit: string; 
  displayValue?: number;
  color: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>
        {displayValue !== undefined ? displayValue.toFixed(0) : value.toFixed(0)}{unit}
      </span>
    </div>
    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);
