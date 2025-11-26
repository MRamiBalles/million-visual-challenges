import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, MessageSquare, Heart, TrendingUp, Eye } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalExperiments: number;
  totalComments: number;
  totalLikes: number;
  totalViews: number;
  totalActivity: number;
}

const Analytics = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalExperiments: 0,
    totalComments: 0,
    totalLikes: 0,
    totalViews: 0,
    totalActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    const [
      { count: usersCount },
      { count: experimentsCount },
      { count: commentsCount },
      { count: likesCount },
      { data: experimentsData },
      { count: activityCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("experiments").select("*", { count: "exact", head: true }),
      supabase.from("experiment_comments").select("*", { count: "exact", head: true }),
      supabase.from("experiment_likes").select("*", { count: "exact", head: true }),
      supabase.from("experiments").select("view_count"),
      supabase.from("user_activity").select("*", { count: "exact", head: true }),
    ]);

    const totalViews = experimentsData?.reduce((sum, exp) => sum + (exp.view_count || 0), 0) || 0;

    setStats({
      totalUsers: usersCount || 0,
      totalExperiments: experimentsCount || 0,
      totalComments: commentsCount || 0,
      totalLikes: likesCount || 0,
      totalViews,
      totalActivity: activityCount || 0,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Experimentos",
      value: stats.totalExperiments,
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Total Comentarios",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "text-purple-500",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Total Vistas",
      value: stats.totalViews,
      icon: Eye,
      color: "text-yellow-500",
    },
    {
      title: "Actividad Total",
      value: stats.totalActivity,
      icon: TrendingUp,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Analíticas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
              <stat.icon className={`w-12 h-12 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Resumen de la Plataforma</h3>
        <div className="space-y-3 text-muted-foreground">
          <p>
            • Promedio de experimentos por usuario:{" "}
            <span className="text-foreground font-semibold">
              {stats.totalUsers > 0 ? (stats.totalExperiments / stats.totalUsers).toFixed(2) : 0}
            </span>
          </p>
          <p>
            • Promedio de comentarios por experimento:{" "}
            <span className="text-foreground font-semibold">
              {stats.totalExperiments > 0
                ? (stats.totalComments / stats.totalExperiments).toFixed(2)
                : 0}
            </span>
          </p>
          <p>
            • Promedio de likes por experimento:{" "}
            <span className="text-foreground font-semibold">
              {stats.totalExperiments > 0
                ? (stats.totalLikes / stats.totalExperiments).toFixed(2)
                : 0}
            </span>
          </p>
          <p>
            • Promedio de vistas por experimento:{" "}
            <span className="text-foreground font-semibold">
              {stats.totalExperiments > 0
                ? (stats.totalViews / stats.totalExperiments).toFixed(2)
                : 0}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;