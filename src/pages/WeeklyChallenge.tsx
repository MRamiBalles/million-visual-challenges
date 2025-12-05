import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { TSPVisualizer } from "@/components/visualizations/TSPVisualizer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, Star } from "lucide-react";
import { useActivityTracker } from "@/hooks/useActivityTracker";

const WeeklyChallenge = () => {
    useActivityTracker("weekly_challenge", "view");

    return (
        <ProblemLayout
            slug="weekly"
            visualizer={<TSPVisualizer seed="WEEK-42-HARD-MODE" />}
        >
            <div className="space-y-8 mt-8 border-t border-border pt-8">

                {/* Challenge Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                            Weekly Boss: The Euler Circuit
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Can you find the optimal path through 20 cities in under 30 seconds?
                        </p>
                    </div>
                    <Card className="p-4 flex items-center gap-4 bg-yellow-500/10 border-yellow-500/20">
                        <div className="text-center">
                            <p className="text-xs text-yellow-500 font-bold uppercase">Reward</p>
                            <div className="flex items-center gap-1 text-2xl font-bold text-yellow-500">
                                <Trophy className="w-5 h-5" />
                                500
                            </div>
                        </div>
                        <div className="h-10 w-px bg-yellow-500/20" />
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground font-bold uppercase">Time Left</p>
                            <div className="flex items-center gap-1 text-xl font-mono text-white">
                                <Timer className="w-4 h-4" />
                                2d 14h
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Scoreboard Preview */}
                <Card className="p-6 bg-card/30 backdrop-blur">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" /> Current Leaderboard
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: "Alice_Quantum", time: "12.4s", score: 980 },
                            { name: "Bob_Turing", time: "14.2s", score: 850 },
                            { name: "Charlie_Nash", time: "15.8s", score: 720 },
                        ].map((entry, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono font-bold w-6 text-center ${i === 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}>#{i + 1}</span>
                                    <span>{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <span className="text-muted-foreground">{entry.time}</span>
                                    <span className="font-bold text-yellow-500">{entry.score} pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">View Full Leaderboard</Button>
                </Card>
            </div>
        </ProblemLayout>
    );
};

export default WeeklyChallenge;
