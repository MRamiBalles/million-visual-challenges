import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, RotateCcw, Zap, CheckCircle2, XCircle, 
  Clock, Terminal, Cpu, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExperimentResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'warning';
  duration: number;
  output: string[];
  metrics?: Record<string, number | string>;
}

// Simulated SCO experiments based on the repository structure
const SCO_EXPERIMENTS = [
  {
    id: 'vacuum_test',
    name: 'Vacuum Test',
    description: 'Test holographic redundancy of computational bulk',
    expectedDuration: 2000,
    outputs: [
      '[ARE] Initializing Algebraic Replay Engine...',
      '[ARE] Loading holographic boundary encoding...',
      '[VACUUM] Testing bulk redundancy hypothesis...',
      '[VACUUM] Boundary particles: 127 | Bulk states: 0',
      '[VACUUM] ✓ BULK REDUNDANCY CONFIRMED',
      '[ARE] Space complexity: O(√T) verified'
    ],
    metrics: { 'Space Ratio': '√T', 'Bulk States': 0, 'Boundary Particles': 127 }
  },
  {
    id: 'kronecker_collapse',
    name: 'Kronecker Collapse (k=5)',
    description: 'Detect algebraic obstruction via Kronecker symbols',
    expectedDuration: 3000,
    outputs: [
      '[KRONECKER] Initializing algebraic motor...',
      '[KRONECKER] Computing Kronecker symbols for k=5...',
      '[KRONECKER] Symbol values: [1, -1, 1, -1, 0]',
      '[KRONECKER] Detecting collapse pattern...',
      '[KRONECKER] ✓ COLLAPSE CONFIRMED at k=5',
      '[ALGEBRAIC] Obstruction detected in character sum'
    ],
    metrics: { 'k': 5, 'Collapse': 'CONFIRMED', 'Obstruction': 'Algebraic' }
  },
  {
    id: 'mcsp_compression',
    name: 'MCSP Compression Bound',
    description: 'Verify Williams O(√T) is optimal',
    expectedDuration: 2500,
    outputs: [
      '[MCSP] Loading Minimum Circuit Size Problem...',
      '[MCSP] Testing compression lower bounds...',
      '[MCSP] Attempting sub-√T compression...',
      '[MCSP] ✗ Compression failed at O(T^0.49)',
      '[MCSP] ✓ BOUND TIGHT: O(√T) is optimal',
      '[WILLIAMS] 2025 result confirmed empirically'
    ],
    metrics: { 'Optimal Bound': 'O(√T)', 'Sub-optimal Test': 'FAILED', 'Williams 2025': 'VERIFIED' }
  },
  {
    id: 'phase_transition',
    name: 'Spin-Glass Phase Transition',
    description: 'Detect SAT phase transition at α~4.267',
    expectedDuration: 4000,
    outputs: [
      '[PHASE] Initializing spin-glass simulator...',
      '[PHASE] Generating random 3-SAT instances (N=100)...',
      '[PHASE] Scanning α from 0 to 7...',
      '[PHASE] Phase boundary detected: α = 4.31 ± 0.05',
      '[PHASE] ✓ CRITICAL POINT CONFIRMED',
      '[MONASSON] Theory prediction α~4.267 within error bars'
    ],
    metrics: { 'Critical α': 4.31, 'Error': '±0.05', 'Phase': 'CRITICAL' }
  },
  {
    id: 'tfnp_classifier',
    name: 'TFNP Reduction Test',
    description: 'Test metamathematical hardness via rwPHP(PLS)',
    expectedDuration: 3500,
    outputs: [
      '[TFNP] Loading TFNP classifier...',
      '[TFNP] Testing reduction to rwPHP(PLS)...',
      '[TFNP] Constructing witness search problem...',
      '[TFNP] Reduction complexity: polynomial verified',
      '[TFNP] ✓ REDUCTION SUCCESSFUL',
      '[META] Metamathematical hardness established'
    ],
    metrics: { 'Reduction': 'rwPHP(PLS)', 'Complexity': 'Polynomial', 'Status': 'SUCCESS' }
  },
  {
    id: 'grokking_test',
    name: 'Grokking Experiment',
    description: 'Test neural oracle generalization',
    expectedDuration: 5000,
    outputs: [
      '[GROKKING] Initializing ML oracle...',
      '[GROKKING] Training on modular arithmetic...',
      '[GROKKING] Epoch 100: Train acc 0.95, Val acc 0.12',
      '[GROKKING] Epoch 500: Train acc 1.00, Val acc 0.23',
      '[GROKKING] Epoch 1000: Train acc 1.00, Val acc 0.98',
      '[GROKKING] ✓ GROKKING DETECTED at epoch ~800',
      '[NEURAL] Sudden generalization confirmed'
    ],
    metrics: { 'Grokking Epoch': 800, 'Final Val Acc': '98%', 'Train Acc': '100%' }
  },
  {
    id: 'holographic_monitor',
    name: 'Holographic Monitor',
    description: 'Real-time visualization of O(√T) simulation',
    expectedDuration: 3000,
    outputs: [
      '[HOLO] Starting holographic monitor...',
      '[HOLO] Boundary encoding active...',
      '[HOLO] T=1000: Space=31.6, Compression=96.8%',
      '[HOLO] T=5000: Space=70.7, Compression=98.6%',
      '[HOLO] ✓ HOLOGRAPHIC PRINCIPLE VERIFIED',
      '[NYE] 2025 boundary theory validated'
    ],
    metrics: { 'Max T': 5000, 'Max Space': 70.7, 'Compression': '98.6%' }
  },
  {
    id: 'epistemic_check',
    name: 'Epistemic Ledger Check',
    description: 'Validate knowledge consistency across phases',
    expectedDuration: 2000,
    outputs: [
      '[EPISTEMIC] Loading knowledge ledger...',
      '[EPISTEMIC] Checking phase 23 consistency...',
      '[EPISTEMIC] Verified: 5 hypotheses, 3 confirmed',
      '[EPISTEMIC] Known limitation: Backbone at 0%',
      '[EPISTEMIC] ✓ LEDGER CONSISTENT',
      '[META] Phase 24 ready for exploration'
    ],
    metrics: { 'Phase': '24/24', 'Hypotheses': 5, 'Confirmed': 3 }
  }
];

export function DemoMode() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentExperiment, setCurrentExperiment] = useState(0);
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [currentOutput, setCurrentOutput] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  const runExperiment = useCallback(async (experiment: typeof SCO_EXPERIMENTS[0]) => {
    return new Promise<ExperimentResult>((resolve) => {
      const startTime = Date.now();
      const outputs: string[] = [];
      let outputIndex = 0;

      const outputInterval = setInterval(() => {
        if (outputIndex < experiment.outputs.length) {
          outputs.push(experiment.outputs[outputIndex]);
          setCurrentOutput([...outputs]);
          outputIndex++;
        } else {
          clearInterval(outputInterval);
          const duration = Date.now() - startTime;
          const hasWarning = experiment.outputs.some(o => o.includes('limitation') || o.includes('anomaly'));
          
          resolve({
            id: experiment.id,
            name: experiment.name,
            status: hasWarning ? 'warning' : 'success',
            duration,
            output: outputs,
            metrics: experiment.metrics
          });
        }
      }, experiment.expectedDuration / experiment.outputs.length);
    });
  }, []);

  const runAllExperiments = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentOutput([]);
    setProgress(0);

    for (let i = 0; i < SCO_EXPERIMENTS.length; i++) {
      if (!isRunning && i > 0) break;
      
      setCurrentExperiment(i);
      setResults(prev => [...prev, {
        id: SCO_EXPERIMENTS[i].id,
        name: SCO_EXPERIMENTS[i].name,
        status: 'running',
        duration: 0,
        output: []
      }]);

      const result = await runExperiment(SCO_EXPERIMENTS[i]);
      
      setResults(prev => prev.map((r, idx) => 
        idx === prev.length - 1 ? result : r
      ));
      
      setProgress(((i + 1) / SCO_EXPERIMENTS.length) * 100);
      
      // Brief pause between experiments
      await new Promise(r => setTimeout(r, 500));
    }

    setIsRunning(false);
  }, [runExperiment]);

  const stopExperiments = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetDemo = useCallback(() => {
    setIsRunning(false);
    setCurrentExperiment(0);
    setResults([]);
    setCurrentOutput([]);
    setProgress(0);
  }, []);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentOutput]);

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2 text-yellow-300">
            <FlaskConical className="w-5 h-5" />
            SCO Demo Mode
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isRunning ? stopExperiments : runAllExperiments}
              className={`border-yellow-500/30 ${isRunning ? 'bg-red-500/20 hover:bg-red-500/30' : 'hover:bg-yellow-500/20'}`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Run All
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetDemo}
              className="border-yellow-500/30 hover:bg-yellow-500/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {isRunning 
                ? `Running: ${SCO_EXPERIMENTS[currentExperiment]?.name}` 
                : results.length > 0 
                  ? 'Completed' 
                  : 'Ready to run'}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Stats */}
        {results.length > 0 && (
          <div className="flex gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              {successCount} passed
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              {warningCount} warnings
            </div>
            <div className="flex items-center gap-1 text-red-400">
              <XCircle className="w-4 h-4" />
              {failedCount} failed
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Terminal Output */}
        <div className="bg-black/60 rounded-lg border border-green-500/20 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border-b border-green-500/20">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-mono">SCO Terminal</span>
          </div>
          <ScrollArea className="h-[200px] p-3" ref={outputRef as any}>
            <div className="font-mono text-xs space-y-1">
              <AnimatePresence>
                {currentOutput.map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${
                      line.includes('✓') ? 'text-green-400' :
                      line.includes('✗') ? 'text-red-400' :
                      line.includes('limitation') || line.includes('anomaly') ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}
                  >
                    {line}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isRunning && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block text-green-400"
                >
                  █
                </motion.span>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Experiment List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SCO_EXPERIMENTS.map((exp, idx) => {
            const result = results.find(r => r.id === exp.id);
            const isCurrent = isRunning && currentExperiment === idx;
            
            return (
              <div
                key={exp.id}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-yellow-500/20 border-yellow-500/50 animate-pulse'
                    : result?.status === 'success'
                    ? 'bg-green-500/10 border-green-500/30'
                    : result?.status === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : result?.status === 'failed'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-black/30 border-gray-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="w-3 h-3" />
                    {exp.name}
                  </span>
                  {result && (
                    result.status === 'running' ? (
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                    ) : result.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : result.status === 'warning' ? (
                      <Zap className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{exp.description}</p>
                {result && result.status !== 'running' && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {result.duration}ms
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
