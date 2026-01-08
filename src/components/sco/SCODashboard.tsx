import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EpistemicLedger } from './EpistemicLedger';
import { PhaseTransitionChart } from './PhaseTransitionChart';
import { HolographicSimulation } from './HolographicSimulation';
import { DemoMode } from './DemoMode';
import { GitHubConnection } from './GitHubConnection';
import { 
  Telescope, 
  Brain, 
  Activity, 
  Layers, 
  Github, 
  ExternalLink,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BenchmarkResult {
  metric: string;
  pureARE: string;
  hybrid: string;
  winner: 'pure' | 'hybrid' | 'tie';
}

const benchmarkResults: BenchmarkResult[] = [
  { metric: 'Time (T=1000)', pureARE: '0.0005s', hybrid: '0.0194s', winner: 'pure' },
  { metric: 'Oracle Hit Rate', pureARE: 'N/A', hybrid: '0%', winner: 'tie' },
  { metric: 'Speedup', pureARE: '1.0x', hybrid: '0.03x', winner: 'pure' },
  { metric: 'Space Complexity', pureARE: 'O(√T)', hybrid: 'O(√T + ML)', winner: 'pure' },
];

const experimentResults = [
  { name: 'Kronecker (k=5)', result: 'COLLAPSE CONFIRMED', significance: 'Algebraic obstruction detected', status: 'success' },
  { name: 'MCSP Compression', result: 'BOUND TIGHT', significance: 'Williams O(√T) is optimal', status: 'success' },
  { name: 'Spin-Glass Phase', result: 'α~4.3 DETECTED', significance: 'Phase transition confirmed', status: 'success' },
  { name: 'Backbone Fraction', result: '0% ANOMALY', significance: 'Detector needs N>100', status: 'warning' },
];

export function SCODashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-cyan-900/40 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Telescope className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">
                  SCO: Structural Complexity Observatory
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  v2.0 Phase 24/24 • STOC 2025 / ICLR 2025 Compliant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                COMPLETADO
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-500/30 hover:bg-purple-500/20"
                onClick={() => window.open('https://github.com/MRamiBalles/PvsNP', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                Repositorio
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-black/40 border border-purple-500/30 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="demo" className="data-[state=active]:bg-purple-500/30">
            <FlaskConical className="w-4 h-4 mr-2" />
            Demo Mode
          </TabsTrigger>
          <TabsTrigger value="github" className="data-[state=active]:bg-purple-500/30">
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="ledger" className="data-[state=active]:bg-purple-500/30">
            <Brain className="w-4 h-4 mr-2" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="phase" className="data-[state=active]:bg-purple-500/30">
            <Activity className="w-4 h-4 mr-2" />
            Phase
          </TabsTrigger>
          <TabsTrigger value="holographic" className="data-[state=active]:bg-purple-500/30">
            <Layers className="w-4 h-4 mr-2" />
            Holographic
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Experiment Results */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-300">Phase 24 Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {experimentResults.map((exp, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      exp.status === 'success' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{exp.name}</span>
                      {exp.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`mb-1 ${
                        exp.status === 'success'
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}
                    >
                      {exp.result}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{exp.significance}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Benchmark Table */}
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-300">Benchmark Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-500/20">
                      <th className="text-left py-2 px-3 text-muted-foreground">Metric</th>
                      <th className="text-center py-2 px-3 text-purple-400">Pure ARE</th>
                      <th className="text-center py-2 px-3 text-cyan-400">Hybrid (ARE + RF)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkResults.map((row, idx) => (
                      <tr key={idx} className="border-b border-orange-500/10">
                        <td className="py-2 px-3">{row.metric}</td>
                        <td className={`text-center py-2 px-3 font-mono ${
                          row.winner === 'pure' ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {row.pureARE}
                        </td>
                        <td className={`text-center py-2 px-3 font-mono ${
                          row.winner === 'hybrid' ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {row.hybrid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Para T pequeño, el motor simbólico puro supera al híbrido. La ventaja neuro-simbólica requiere T {'>'} 10⁶
              </p>
            </CardContent>
          </Card>
          
          {/* Quick view of all components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EpistemicLedger />
            <HolographicSimulation />
          </div>
        </TabsContent>
        
        <TabsContent value="demo">
          <DemoMode />
        </TabsContent>
        
        <TabsContent value="github">
          <GitHubConnection />
        </TabsContent>
        
        <TabsContent value="ledger">
          <EpistemicLedger />
        </TabsContent>
        
        <TabsContent value="phase">
          <PhaseTransitionChart />
        </TabsContent>
        
        <TabsContent value="holographic">
          <HolographicSimulation />
        </TabsContent>
      </Tabs>
      
      {/* Academic Disclaimer */}
      <Card className="bg-yellow-500/5 border-yellow-500/30 backdrop-blur-sm">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-300 font-medium mb-1">Disclaimer Académico</p>
              <p className="text-xs text-muted-foreground">
                Este software es un instrumento de exploración. No constituye una prueba formal de P ≠ NP, 
                sino una implementación de las herramientas modernas (meta-complejidad, holografía, IA) 
                necesarias para investigar dicha separación.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
