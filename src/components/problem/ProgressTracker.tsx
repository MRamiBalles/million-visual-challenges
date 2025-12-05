import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UserProgress } from "@/types/database";
import { toast } from "sonner";

interface ProgressTrackerProps {
    problemId: number;
    initialProgress: UserProgress | null;
}

export const ProgressTracker = ({ problemId, initialProgress }: ProgressTrackerProps) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<UserProgress | null>(initialProgress);
    const [loading, setLoading] = useState(false);

    const completion = progress?.completion_percentage || 0;

    const handleStart = async () => {
        if (!user) {
            toast.error("Please log in to track progress");
            return;
        }
        setLoading(true);
        // Create initial record
        const { data, error } = await supabase
            .from('user_progress')
            .insert({
                user_id: user.id,
                problem_id: problemId,
                current_level: 'simple',
                completed_sections: {},
                total_time_spent: 0,
                completion_percentage: 0
            })
            .select()
            .single();

        if (error) {
            toast.error("Failed to start tracking");
        } else {
            setProgress(data as UserProgress);
            toast.success("Progress tracking started!");
        }
        setLoading(false);
    };

    if (!progress) {
        return (
            <div className="bg-card/50 backdrop-blur rounded-xl p-6 border border-border text-center">
                <h3 className="font-semibold mb-2">Track Your Journey</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Save your progress, earn badges, and contribute to the community.
                </p>
                <Button onClick={handleStart} disabled={loading} className="w-full">
                    Start Learning
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-card/50 backdrop-blur rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-mono">
                        {Math.floor((progress.total_time_spent || 0) / 60)}h {(progress.total_time_spent || 0) % 60}m
                    </span>
                </div>
                <div className={`text-xs font-bold ${completion === 100 ? 'text-green-500' : 'text-primary'}`}>
                    {completion}%
                </div>
            </div>

            <Progress value={completion} className="h-2 mb-3" />

            {completion === 100 ? (
                <div className="flex items-center gap-2 text-green-500 text-sm font-semibold justify-center bg-green-500/10 py-1 rounded">
                    <CheckCircle className="w-4 h-4" /> Completed
                </div>
            ) : (
                <div className="text-xs text-center text-muted-foreground">
                    Level: <span className="capitalize text-foreground font-medium">{progress.current_level}</span>
                </div>
            )}
        </div>
    );
};
