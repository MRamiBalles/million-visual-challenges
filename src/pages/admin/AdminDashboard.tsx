import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, loading } = useAdmin();

  useEffect(() => {
    if (!loading && !isAdmin && !isModerator) {
      navigate("/");
    }
  }, [isAdmin, isModerator, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;