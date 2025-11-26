import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStatistics } from "@/hooks/useUserStatistics";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatisticsCard } from "@/components/profile/StatisticsCard";
import { AchievementsBadges } from "@/components/profile/AchievementsBadges";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { data: statistics, isLoading: statsLoading } = useUserStatistics(user?.id);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile || !statistics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          onEdit={() => setIsEditDialogOpen(true)}
        />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <StatisticsCard statistics={statistics} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementsBadges userId={user.id} />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Historial de actividad próximamente...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        profile={profile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default Profile;
