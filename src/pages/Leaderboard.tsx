import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, TrendingUp, Users, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  user_id: string;
  total_time: number;
  problems_count: number;
  experiments_count: number;
}

interface PopularExperiment {
  id: string;
  title: string;
  likes_count: number;
  view_count: number;
  problem_slug: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState<LeaderboardUser[]>([]);
  const [popularExperiments, setPopularExperiments] = useState<PopularExperiment[]>([]);
  const [topContributors, setTopContributors] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);

    // Load most active users (by time spent)
    const { data: activeData } = await supabase
      .from("user_activity")
      .select("user_id, duration_seconds, problem_slug")
      .order("duration_seconds", { ascending: false });

    if (activeData) {
      const userStats = activeData.reduce((acc: Record<string, LeaderboardUser>, activity) => {
        if (!acc[activity.user_id]) {
          acc[activity.user_id] = {
            user_id: activity.user_id,
            total_time: 0,
            problems_count: 0,
            experiments_count: 0,
          };
        }
        acc[activity.user_id].total_time += activity.duration_seconds;
        return acc;
      }, {});

      const sortedActive = Object.values(userStats)
        .sort((a, b) => b.total_time - a.total_time)
        .slice(0, 10);
      setActiveUsers(sortedActive);
    }

    // Load most popular experiments
    const { data: experimentsData } = await supabase
      .from("experiments")
      .select("id, title, likes_count, view_count, problem_slug")
      .eq("is_public", true)
      .order("likes_count", { ascending: false })
      .limit(10);

    if (experimentsData) {
      setPopularExperiments(experimentsData);
    }

    // Load top contributors (by number of public experiments)
    const { data: contributorsData } = await supabase
      .from("experiments")
      .select("user_id")
      .eq("is_public", true);

    if (contributorsData) {
      const contributorStats = contributorsData.reduce((acc: Record<string, number>, exp) => {
        acc[exp.user_id] = (acc[exp.user_id] || 0) + 1;
        return acc;
      }, {});

      const sortedContributors = Object.entries(contributorStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([user_id, experiments_count]) => ({
          user_id,
          total_time: 0,
          problems_count: 0,
          experiments_count,
        }));
      setTopContributors(sortedContributors);
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

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
            <Trophy className="w-6 h-6 text-primary" />
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
            Leaderboard Comunitario
          </h1>
          <p className="text-muted-foreground mb-8">
            Los mejores exploradores y contribuidores de la comunidad
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Cargando rankings...</p>
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="active" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Más Activos
                </TabsTrigger>
                <TabsTrigger value="popular" className="gap-2">
                  <Award className="w-4 h-4" />
                  Experimentos Populares
                </TabsTrigger>
                <TabsTrigger value="contributors" className="gap-2">
                  <Users className="w-4 h-4" />
                  Top Contributors
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Usuarios Más Activos</h2>
                  <div className="space-y-4">
                    {activeUsers.map((user, index) => (
                      <motion.div
                        key={user.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold w-12">
                            {getRankIcon(index)}
                          </span>
                          <div>
                            <p className="font-medium">Usuario {user.user_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(user.total_time)} de exploración
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {formatTime(user.total_time)}
                        </Badge>
                      </motion.div>
                    ))}
                    {activeUsers.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aún no hay usuarios activos
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="popular">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Experimentos Más Populares</h2>
                  <div className="space-y-4">
                    {popularExperiments.map((experiment, index) => (
                      <motion.div
                        key={experiment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        onClick={() => navigate(`/community`)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-2xl font-bold w-12">
                            {getRankIcon(index)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{experiment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {experiment.problem_slug}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            ❤️ {experiment.likes_count}
                          </Badge>
                          <Badge variant="outline">
                            👁️ {experiment.view_count}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                    {popularExperiments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aún no hay experimentos públicos
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="contributors">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Top Contributors</h2>
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <motion.div
                        key={contributor.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold w-12">
                            {getRankIcon(index)}
                          </span>
                          <div>
                            <p className="font-medium">Usuario {contributor.user_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {contributor.experiments_count} experimentos compartidos
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {contributor.experiments_count} 🎁
                        </Badge>
                      </motion.div>
                    ))}
                    {topContributors.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aún no hay contributors
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Leaderboard;
