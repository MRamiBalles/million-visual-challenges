import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useUserStatistics } from "@/hooks/useUserStatistics";
import { useAchievements } from "@/hooks/useAchievements";
import { millenniumProblems } from "@/data/millennium-problems";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  ArrowRight,
  Target,
  Clock,
  Bookmark
} from "lucide-react";
import { EmailVerification } from "@/components/auth/EmailVerification";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: statistics } = useUserStatistics(user?.id);
  const { unlockedCount, totalCount, userAchievements } = useAchievements(user?.id);

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Get unvisited problems for recommendations
  const visitedProblemIds = new Set(); // TODO: Get from user_progress
  const recommendedProblems = millenniumProblems.filter(p => !visitedProblemIds.has(p.id)).slice(0, 3);

  // Recent achievements (last 3)
  const recentAchievements = userAchievements.slice(0, 3);

  const completionPercentage = statistics ? (statistics.problems_visited / 7) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">
            ¡Bienvenido, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Continúa tu jornada explorando los Problemas del Milenio
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Email Verification Alert */}
        <div className="mb-6">
          <EmailVerification />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Problemas Visitados</p>
                  <p className="text-3xl font-bold">{statistics?.problems_visited || 0}/7</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Logros</p>
                  <p className="text-3xl font-bold">{unlockedCount}/{totalCount}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Total</p>
                  <p className="text-3xl font-bold">
                    {Math.floor((statistics?.total_time_seconds || 0) / 60)}m
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Marcadores</p>
                  <p className="text-3xl font-bold">{statistics?.bookmarks_count || 0}</p>
                </div>
                <Bookmark className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tu Progreso</CardTitle>
                    <CardDescription>Explora los 7 Problemas del Milenio</CardDescription>
                  </div>
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progreso General</span>
                    <span className="text-muted-foreground">
                      {Math.round(completionPercentage)}%
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  Ver Perfil Completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Recommended Problems */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Problemas Recomendados</CardTitle>
                    <CardDescription>Continúa tu aprendizaje</CardDescription>
                  </div>
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendedProblems.length > 0 ? (
                  recommendedProblems.map((problem) => (
                    <div
                      key={problem.slug}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/${problem.slug}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{problem.title}</h4>
                        <p className="text-sm text-muted-foreground">{problem.field}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      ¡Has visitado todos los problemas! 🎉
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/')}
                    >
                      Ver Todos los Problemas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Logros Recientes</CardTitle>
                <CardDescription>Tus últimos desbloqueos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((ua) => (
                    <div
                      key={ua.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className="text-2xl">{ua.achievement.icon || '🏆'}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{ua.achievement.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          +{ua.achievement.points} puntos
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>¡Empieza a explorar para desbloquear logros!</p>
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  Ver Todos los Logros
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorar Problemas
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Ver Mi Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;