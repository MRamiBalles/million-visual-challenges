import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Star } from "lucide-react";

export const DailyChallengeCard = () => {
    const navigate = useNavigate();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Simple fast hash of date to city name for flavor
    const cityNames = ["Berlin", "Tokyo", "Paris", "New York", "London", "Sydney", "Cairo", "Rio"];
    const seedNum = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const cityName = cityNames[seedNum % cityNames.length];

    return (
        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-mono text-indigo-400 uppercase">Daily Challenge</span>
                    </div>
                    <div className="flex bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] text-yellow-500 font-bold items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>+50 PTS</span>
                    </div>
                </div>
                <CardTitle className="text-lg">Operation: {cityName}</CardTitle>
                <CardDescription>
                    Optimal Route Calculation for {dateStr}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5 mb-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    <div className="h-16 flex items-center justify-center">
                        <div className="animate-pulse bg-indigo-500/20 rounded-full h-8 w-8 flex items-center justify-center">
                            <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                        </div>
                    </div>
                </div>
                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-500"
                    onClick={() => navigate(`/pvsnp?seed=${dateStr}`)}
                >
                    <Play className="w-4 h-4 mr-2" /> Start Challenge
                </Button>
            </CardContent>
        </Card>
    );
};
