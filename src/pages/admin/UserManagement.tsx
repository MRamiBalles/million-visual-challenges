import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, UserX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  created_at: string;
  roles: string[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    // Load profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, username, display_name")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Load roles for each user
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const rolesByUser = (rolesData || []).reduce((acc: any, item) => {
      if (!acc[item.user_id]) acc[item.user_id] = [];
      acc[item.user_id].push(item.role);
      return acc;
    }, {});

    const usersWithRoles = profiles?.map((profile) => ({
      id: profile.user_id,
      username: profile.username || "",
      display_name: profile.display_name || "",
      email: "",
      created_at: "",
      roles: rolesByUser[profile.user_id] || ["user"],
    })) || [];

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: "user" | "moderator" | "admin") => {
    const currentRoles = users.find((u) => u.id === userId)?.roles || [];
    
    // Remove all current roles except 'user'
    const rolesToRemove = currentRoles.filter((r) => r !== "user");
    for (const role of rolesToRemove) {
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as "admin" | "moderator" | "user");
    }

    // Add new role if not 'user'
    if (newRole !== "user") {
      const { error } = await supabase
        .from("user_roles")
        .insert([{
          user_id: userId,
          role: newRole,
        }]);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el rol",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Rol actualizado",
      description: `Usuario ahora es ${newRole}`,
    });

    loadUsers();
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
        <Badge variant="secondary">{users.length} usuarios</Badge>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{user.display_name}</h3>
                  <span className="text-sm text-muted-foreground">@{user.username}</span>
                  {user.roles.includes("admin") && (
                    <Badge variant="destructive">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {user.roles.includes("moderator") && !user.roles.includes("admin") && (
                    <Badge>
                      <Shield className="w-3 h-3 mr-1" />
                      Moderador
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={user.roles.includes("admin") ? "admin" : user.roles.includes("moderator") ? "moderator" : "user"}
                  onValueChange={(value) => updateUserRole(user.id, value as "user" | "moderator" | "admin")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;