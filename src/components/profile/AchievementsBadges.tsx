import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAchievements } from "@/hooks/useAchievements";
import { Lock } from "lucide-react";

interface AchievementsBadgesProps {
    userId: string;
}

export const AchievementsBadges = ({ userId }: AchievementsBadgesProps) => {
    const {
        allAchievements,
        userAchievements,
        unlockedCount,
        totalCount,
        completionPercentage,
        isUnlocked,
        isLoading
    } = useAchievements(userId);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Cargando logros...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const categoryColors = {
        learning: 'bg-blue-500',
        progress: 'bg-green-500',
        community: 'bg-purple-500',
        research: 'bg-orange-500',
    };

    const categoryLabels = {
        learning: 'Aprendizaje',
        progress: 'Progreso',
        community: 'Comunidad',
        research: 'Investigación',
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Logros</CardTitle>
                        <CardDescription>
                            {unlockedCount} de {totalCount} desbloqueados
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{completionPercentage}%</p>
                        <p className="text-xs text-muted-foreground">Completado</p>
                    </div>
                </div>
                <Progress value={completionPercentage} className="mt-4" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allAchievements.map((achievement) => {
                        const unlocked = isUnlocked(achievement.id);
                        const userAchievement = userAchievements.find(
                            ua => ua.achievement_id === achievement.id
                        );

                        return (
                            <div
                                key={achievement.id}
                                className={`
                  relative p-4 rounded-lg border transition-all
                  ${unlocked
                                        ? 'bg-card hover:shadow-md'
                                        : 'bg-muted/50 opacity-60'
                                    }
                `}
                            >
                                {/* Lock overlay for locked achievements */}
                                {!unlocked && (
                                    <div className="absolute top-2 right-2">
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className="text-4xl mb-2">
                                    {achievement.icon || '🏆'}
                                </div>

                                {/* Name and category */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">
                                            {achievement.name}
                                        </h4>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${unlocked ? categoryColors[achievement.category] : ''}`}
                                        >
                                            {categoryLabels[achievement.category]}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {achievement.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-medium text-primary">
                                            +{achievement.points} pts
                                        </span>
                                        {unlocked && userAchievement && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(userAchievement.unlocked_at).toLocaleDateString('es-ES')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {unlockedCount === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">¡Comienza a explorar los problemas para desbloquear logros!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
