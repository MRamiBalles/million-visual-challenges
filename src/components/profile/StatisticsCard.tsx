import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserStatistics, formatTimeSpent } from "@/hooks/useUserStatistics";
import { Clock, BookOpen, Bookmark, Trophy, Target } from "lucide-react";

interface StatisticsCardProps {
    statistics: UserStatistics;
}

export const StatisticsCard = ({ statistics }: StatisticsCardProps) => {
    const stats = [
        {
            icon: BookOpen,
            label: 'Problemas Visitados',
            value: statistics.problems_visited,
            max: 7,
            color: 'text-blue-500',
        },
        {
            icon: Clock,
            label: 'Tiempo Total',
            value: formatTimeSpent(statistics.total_time_seconds),
            subtitle: `${statistics.total_time_seconds}s`,
            color: 'text-green-500',
        },
        {
            icon: Bookmark,
            label: 'Marcadores',
            value: statistics.bookmarks_count,
            color: 'text-yellow-500',
        },
        {
            icon: Trophy,
            label: 'Logros Desbloqueados',
            value: statistics.achievements_count,
            color: 'text-purple-500',
        },
        {
            icon: Target,
            label: 'Puntos Totales',
            value: statistics.total_points,
            color: 'text-orange-500',
        },
    ];

    const completionPercentage = (statistics.problems_visited / 7) * 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Estadísticas de Aprendizaje</CardTitle>
                <CardDescription>
                    Tu progreso en los Problemas del Milenio
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Progress Overview */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Progreso General</span>
                        <span className="text-muted-foreground">
                            {statistics.problems_visited}/7 problemas
                        </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                        {Math.round(completionPercentage)}% completado
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                            >
                                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stat.value}
                                        {stat.max && (
                                            <span className="text-base text-muted-foreground font-normal">
                                                /{stat.max}
                                            </span>
                                        )}
                                    </p>
                                    {stat.subtitle && (
                                        <p className="text-xs text-muted-foreground">
                                            {stat.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Last Activity */}
                {statistics.last_active_at && (
                    <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                        Última actividad: {new Date(statistics.last_active_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
