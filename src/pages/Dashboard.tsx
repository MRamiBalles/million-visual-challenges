import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Clock, Target, Award, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { millenniumProblems } from "@/data/millennium-problems";

interface ActivityStats {
  totalTime: number;
  totalExperiments: number;
  problemsExplored: number;
  favoriteProblems: { slug: string; count: number }[];
  recentActivity: { date: string; duration: number }[];
  timeByProblem: { slug: string; time: number }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    setLoading(true);

    // Load experiments count
    const { data: experiments } = await supabase
      .from("experiments")
      .select("problem_slug")
      .eq("user_id", user?.id);

    // Load activity data
    const { data: activity } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", user?.id)
      .order("session_date", { ascending: false });

    if (experiments && activity) {
      // Calculate stats
      const totalTime = activity.reduce((sum, a) => sum + a.duration_seconds, 0);
      const problemsExplored = new Set(activity.map(a => a.problem_slug)).size;

      // Count experiments per problem
      const problemCounts = experiments.reduce((acc, exp) => {
        acc[exp.problem_slug] = (acc[exp.problem_slug] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteProblems = Object.entries(problemCounts)
        .map(([slug, count]) => ({ slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Recent activity (last 7 days)
      const recentActivity = activity
        .slice(0, 7)
        .map(a => ({
          date: a.session_date,
          duration: a.duration_seconds,
        }));

      // Time by problem
      const timeByProblemMap = activity.reduce((acc, a) => {
        acc[a.problem_slug] = (acc[a.problem_slug] || 0) + a.duration_seconds;
        return acc;
      }, {} as Record<string, number>);

      const timeByProblem = Object.entries(timeByProblemMap)
        .map(([slug, time]) => ({ slug, time }))
        .sort((a, b) => b.time - a.time);

      setStats({
        totalTime,
        totalExperiments: experiments.length,
        problemsExplored,
        favoriteProblems,
        recentActivity,
        timeByProblem,
      });
    }

    setLoading(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getProblemName = (slug: string): string => {
    const problem = millenniumProblems.find(p => p.slug === slug);
    return problem?.title || slug;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-header border-b border-border sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            
            <Badge variant="secondary" className="gap-2">
              <Award className="w-4 h-4" />
              Mi Dashboard
            </Badge>
          </div>
        </div>
      </motion.header>

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
            Mi Progreso
          </h1>
          <p className="text-muted-foreground mb-8">
            Estadísticas y análisis de tu aprendizaje
          </p>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tiempo Total</div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatTime(stats?.totalTime || 0)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dedicado a explorar problemas
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-accent/5 border-accent/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Experimentos</div>
                    <div className="text-2xl font-bold text-foreground">
                      {stats?.totalExperiments || 0}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Guardados en total
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-muted/30 border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Problemas</div>
                    <div className="text-2xl font-bold text-foreground">
                      {stats?.problemsExplored || 0}/7
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Explorados hasta ahora
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-green-500/5 border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Progreso</div>
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(((stats?.problemsExplored || 0) / 7) * 100)}%
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  De cobertura completa
                </p>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Time by Problem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  Tiempo por Problema
                </h3>
                
                {stats?.timeByProblem.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aún no has explorado ningún problema
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats?.timeByProblem.map((item, index) => {
                      const maxTime = stats.timeByProblem[0]?.time || 1;
                      const percentage = (item.time / maxTime) * 100;
                      
                      return (
                        <div key={item.slug} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-foreground">
                              {getProblemName(item.slug)}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTime(item.time)}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Favorite Problems */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  Problemas Favoritos
                </h3>
                
                {stats?.favoriteProblems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Guarda algunos experimentos para ver tus favoritos
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats?.favoriteProblems.map((item, index) => {
                      const problem = millenniumProblems.find(p => p.slug === item.slug);
                      
                      return (
                        <div
                          key={item.slug}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/${item.slug}`)}
                        >
                          <div className="text-3xl font-bold text-primary">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">
                              {problem?.title || item.slug}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.count} {item.count === 1 ? "experimento" : "experimentos"}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {item.count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Acciones Rápidas
              </h3>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => navigate("/experiments")}>
                  Ver mis experimentos
                </Button>
                <Button onClick={() => navigate("/community")} variant="secondary">
                  Explorar galería comunitaria
                </Button>
                <Button onClick={() => navigate("/")} variant="outline">
                  Explorar problemas
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Dashboard;