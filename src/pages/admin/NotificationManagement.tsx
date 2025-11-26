import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

const NotificationManagement = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        type,
        title,
        message,
        created_at,
        read,
        user_id,
        profiles (username, display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive",
      });
    } else {
      setNotifications((data as any) || []);
    }

    setLoading(false);
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Notificación eliminada",
        description: "La notificación se ha eliminado correctamente",
      });
      loadNotifications();
    }
  };

  const deleteAllForUser = async (userId: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar las notificaciones",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Notificaciones eliminadas",
        description: "Todas las notificaciones del usuario han sido eliminadas",
      });
      loadNotifications();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gestión de Notificaciones</h2>
        <Badge variant="secondary">{notifications.length} notificaciones</Badge>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{notification.profiles.display_name}</span>
                  <span className="text-sm text-muted-foreground">
                    @{notification.profiles.username}
                  </span>
                  <Badge variant={notification.read ? "secondary" : "default"}>
                    {notification.read ? "Leída" : "No leída"}
                  </Badge>
                  <Badge variant="outline">{notification.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString("es-ES")}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteAllForUser(notification.user_id)}
                >
                  Limpiar usuario
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationManagement;