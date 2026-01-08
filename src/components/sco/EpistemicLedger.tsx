import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Brain, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LedgerEntry {
  id: string;
  timestamp: Date;
  type: 'hypothesis' | 'verification' | 'refutation' | 'breakthrough';
  content: string;
  confidence: number;
  status: 'pending' | 'verified' | 'rejected' | 'exploring';
  source: string;
}

const initialEntries: LedgerEntry[] = [
  {
    id: '1',
    timestamp: new Date('2026-01-08T10:00:00'),
    type: 'hypothesis',
    content: 'Kronecker collapse detected at k=5 suggests algebraic obstruction',
    confidence: 85,
    status: 'verified',
    source: 'Algebraic Engine'
  },
  {
    id: '2',
    timestamp: new Date('2026-01-08T10:15:00'),
    type: 'verification',
    content: 'Williams O(√T) bound confirmed as optimal via MCSP compression',
    confidence: 92,
    status: 'verified',
    source: 'Holographic Motor'
  },
  {
    id: '3',
    timestamp: new Date('2026-01-08T10:30:00'),
    type: 'breakthrough',
    content: 'Phase transition at α~4.3 matches Monasson-Zecchina prediction',
    confidence: 78,
    status: 'exploring',
    source: 'Phase Detector'
  },
  {
    id: '4',
    timestamp: new Date('2026-01-08T10:45:00'),
    type: 'hypothesis',
    content: 'TFNP reduction to rwPHP(PLS) shows metamathematical hardness',
    confidence: 65,
    status: 'pending',
    source: 'TFNP Classifier'
  },
  {
    id: '5',
    timestamp: new Date('2026-01-08T11:00:00'),
    type: 'refutation',
    content: 'Backbone fraction at 0% - detector needs recalibration for N>100',
    confidence: 95,
    status: 'rejected',
    source: 'Phase Detector'
  }
];

const typeIcons = {
  hypothesis: Brain,
  verification: CheckCircle2,
  refutation: AlertCircle,
  breakthrough: Zap
};

const typeColors = {
  hypothesis: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  verification: 'bg-green-500/20 text-green-400 border-green-500/30',
  refutation: 'bg-red-500/20 text-red-400 border-red-500/30',
  breakthrough: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const statusColors = {
  pending: 'bg-gray-500/20 text-gray-400',
  verified: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  exploring: 'bg-purple-500/20 text-purple-400'
};

export function EpistemicLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries);
  const [totalConfidence, setTotalConfidence] = useState(0);
  const [activePhase, setActivePhase] = useState(23);

  useEffect(() => {
    const verified = entries.filter(e => e.status === 'verified');
    const avg = verified.length > 0 
      ? verified.reduce((acc, e) => acc + e.confidence, 0) / verified.length 
      : 0;
    setTotalConfidence(avg);
  }, [entries]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase(prev => prev === 24 ? 23 : 24);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-300">
            <BookOpen className="w-5 h-5" />
            Epistemic Ledger
          </CardTitle>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Phase {activePhase}/24
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>System Confidence</span>
              <span>{totalConfidence.toFixed(1)}%</span>
            </div>
            <Progress value={totalConfidence} className="h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <AnimatePresence>
            {entries.map((entry, index) => {
              const Icon = typeIcons[entry.type];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`mb-3 p-3 rounded-lg border ${typeColors[entry.type]} relative overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" />
                  <div className="flex items-start gap-3 pl-2">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${statusColors[entry.status]}`}>
                          {entry.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{entry.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          Source: {entry.source}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-current rounded-full transition-all duration-500"
                              style={{ width: `${entry.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs">{entry.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
