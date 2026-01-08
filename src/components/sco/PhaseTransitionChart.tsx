import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Area, ComposedChart 
} from 'recharts';
import { Activity, Thermometer, Target } from 'lucide-react';

interface PhaseData {
  alpha: number;
  satisfiability: number;
  backbone: number;
  hardness: number;
  phase: 'underconstrained' | 'critical' | 'overconstrained';
}

// SAT phase transition simulation based on random 3-SAT
function generatePhaseData(numVariables: number): PhaseData[] {
  const data: PhaseData[] = [];
  const criticalAlpha = 4.267; // Known critical ratio for 3-SAT
  
  for (let alpha = 0; alpha <= 7; alpha += 0.1) {
    // Satisfiability probability follows sharp threshold
    const delta = (alpha - criticalAlpha) * Math.sqrt(numVariables) / 10;
    const satisfiability = 100 / (1 + Math.exp(delta));
    
    // Backbone fraction jumps at critical point
    const backboneBase = alpha < criticalAlpha 
      ? Math.min(alpha / criticalAlpha * 0.1, 0.1)
      : Math.min(0.1 + (alpha - criticalAlpha) / 3 * 0.9, 1);
    const backbone = backboneBase * 100 * (0.9 + Math.random() * 0.2);
    
    // Hardness peaks at critical point (Monasson-Zecchina)
    const distFromCritical = Math.abs(alpha - criticalAlpha);
    const hardness = Math.exp(-distFromCritical * distFromCritical / 0.5) * 100;
    
    let phase: 'underconstrained' | 'critical' | 'overconstrained';
    if (alpha < criticalAlpha - 0.3) phase = 'underconstrained';
    else if (alpha > criticalAlpha + 0.3) phase = 'overconstrained';
    else phase = 'critical';
    
    data.push({
      alpha: parseFloat(alpha.toFixed(2)),
      satisfiability: parseFloat(satisfiability.toFixed(2)),
      backbone: parseFloat(Math.max(0, Math.min(100, backbone)).toFixed(2)),
      hardness: parseFloat(hardness.toFixed(2)),
      phase
    });
  }
  
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PhaseData;
    return (
      <div className="bg-black/90 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
        <p className="text-purple-300 font-mono mb-2">α = {label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-green-400">
            SAT Probability: {data.satisfiability.toFixed(1)}%
          </p>
          <p className="text-blue-400">
            Backbone: {data.backbone.toFixed(1)}%
          </p>
          <p className="text-orange-400">
            Hardness: {data.hardness.toFixed(1)}%
          </p>
          <Badge 
            variant="outline" 
            className={`mt-2 ${
              data.phase === 'critical' 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : data.phase === 'underconstrained'
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}
          >
            {data.phase.toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  }
  return null;
};

export function PhaseTransitionChart() {
  const [numVariables, setNumVariables] = useState(100);
  const [animatedAlpha, setAnimatedAlpha] = useState(0);
  
  const data = useMemo(() => generatePhaseData(numVariables), [numVariables]);
  
  // Animate through alpha values
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedAlpha(prev => {
        const next = prev + 0.05;
        return next > 7 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  const currentPhase = data.find(d => Math.abs(d.alpha - animatedAlpha) < 0.1);
  
  return (
    <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2 text-cyan-300">
            <Activity className="w-5 h-5" />
            SAT Phase Transition (3-SAT)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${
                currentPhase?.phase === 'critical' 
                  ? 'bg-red-500/30 text-red-300 border-red-500/50 animate-pulse' 
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}
            >
              α = {animatedAlpha.toFixed(2)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            Variables: {numVariables}
          </div>
          <Slider
            value={[numVariables]}
            onValueChange={(v) => setNumVariables(v[0])}
            min={50}
            max={500}
            step={50}
            className="w-32"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="hardnessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="alpha" 
                stroke="#666"
                tick={{ fill: '#888', fontSize: 11 }}
                label={{ value: 'α (clause/variable ratio)', position: 'bottom', fill: '#888', fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#888', fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Critical phase region */}
              <ReferenceLine 
                x={4.267} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                label={{ value: 'αc ≈ 4.267', position: 'top', fill: '#ef4444', fontSize: 10 }}
              />
              
              {/* Current position marker */}
              <ReferenceLine 
                x={animatedAlpha} 
                stroke="#a855f7" 
                strokeWidth={2}
              />
              
              {/* Hardness area */}
              <Area 
                type="monotone" 
                dataKey="hardness" 
                fill="url(#hardnessGradient)"
                stroke="transparent"
              />
              
              {/* Lines */}
              <Line 
                type="monotone" 
                dataKey="satisfiability" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                name="SAT Probability"
              />
              <Line 
                type="monotone" 
                dataKey="backbone" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Backbone %"
              />
              <Line 
                type="monotone" 
                dataKey="hardness" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                name="Computational Hardness"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">SAT Probability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Backbone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Hardness</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
