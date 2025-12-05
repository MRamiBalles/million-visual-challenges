import { useState } from 'react';
import { ProblemLayout } from "@/components/layout/ProblemLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Brain, Trophy } from "lucide-react";

interface Market {
    id: string;
    question: string;
    yesPool: number;
    noPool: number;
    volume: number;
    endDate: string;
    category: "Math" | "Community";
}

const MOCK_MARKETS: Market[] = [
    {
        id: "m1",
        question: "Will the Riemann Hypothesis be solved by 2030?",
        yesPool: 15000,
        noPool: 85000,
        volume: 1200,
        endDate: "2029-12-31",
        category: "Math"
    },
    {
        id: "m2",
        question: "Will 'Entropy_Enthusiast' crack the Weekly Boss > 950pts?",
        yesPool: 4000,
        noPool: 2000,
        volume: 350,
        endDate: "2024-03-10",
        category: "Community"
    },
    {
        id: "m3",
        question: "Is P = NP?",
        yesPool: 5000,
        noPool: 995000,
        volume: 50000,
        endDate: "2050-01-01",
        category: "Math"
    }
];

export const InsightMarket = () => {
    return (
        <ProblemLayout slug="market" title="Insight Market" subtitle="Predict the Future of Mathematics">
            <div className="mt-8 space-y-6">

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-full">
                                <DollarSign className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Total Volume</p>
                                <p className="text-2xl font-bold text-slate-100">1.2M <span className="text-sm font-normal text-slate-400">pts</span></p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-full">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Active Traders</p>
                                <p className="text-2xl font-bold text-slate-100">842</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-full">
                                <Brain className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Accuracy Rating</p>
                                <p className="text-2xl font-bold text-slate-100">88.5%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Markets Grid */}
                <h3 className="text-xl font-bold text-slate-200 mt-8 mb-4">Live Markets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_MARKETS.map(market => (
                        <MarketCard key={market.id} market={market} />
                    ))}
                </div>
            </div>
        </ProblemLayout>
    );
};

const MarketCard = ({ market }: { market: Market }) => {
    const total = market.yesPool + market.noPool;
    const yesPercent = Math.round((market.yesPool / total) * 100);

    return (
        <Card className="bg-slate-950 border-slate-800 hover:border-slate-700 transition-all">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2 border-slate-700 text-slate-400">{market.category}</Badge>
                    <span className="text-xs text-slate-500 font-mono">Vol: {market.volume}</span>
                </div>
                <CardTitle className="text-lg leading-snug text-slate-200">
                    {market.question}
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                    Resolves: {market.endDate}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Probability Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm font-semibold">
                            <span className="text-green-500">YES {yesPercent}%</span>
                            <span className="text-red-500">{100 - yesPercent}% NO</span>
                        </div>
                        <Progress value={yesPercent} className="h-2 bg-red-900/30" indicatorClassName="bg-green-500" />
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" className="border-green-900/50 hover:bg-green-900/20 text-green-500 hover:text-green-400">
                            Bet YES
                            <span className="ml-2 text-xs opacity-70">(1.2x)</span>
                        </Button>
                        <Button variant="outline" className="border-red-900/50 hover:bg-red-900/20 text-red-500 hover:text-red-400">
                            Bet NO
                            <span className="ml-2 text-xs opacity-70">({(1 / ((100 - yesPercent) / 100)).toFixed(1)}x)</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default InsightMarket;
