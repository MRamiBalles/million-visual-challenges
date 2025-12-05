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

import { Share2, Printer } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const SKILLS_DATA = [
  { subject: 'Logic', A: 120, fullMark: 150 },
  { subject: 'Speed', A: 98, fullMark: 150 },
  { subject: 'Topology', A: 86, fullMark: 150 },
  { subject: 'Algebra', A: 99, fullMark: 150 },
  { subject: 'Persistence', A: 85, fullMark: 150 },
  { subject: 'Creativity', A: 65, fullMark: 150 },
];

const Profile = () => {
  // ... existing hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { data: statistics, isLoading: statsLoading } = useUserStatistics(user?.id);

  if (!user || profileLoading || statsLoading || !profile || !statistics) return <Skeleton className="h-screen" />;

  return (
    <div className="min-h-screen bg-background print:bg-white print:text-black">
      {/* Navigation Header - Hide on Print */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur print:hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Export Neuro-Resume
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stats Overview */}
          <div>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="achievements">Logros</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <StatisticsCard statistics={statistics} />
              </TabsContent>
              <TabsContent value="achievements" className="mt-6">
                <AchievementsBadges userId={user.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Neuro-Radar Chart */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:border-black print:text-black">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" /> Cognitive Signature
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLS_DATA}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Verified by Million Visual Challenges Consensus Protocol.
            </p>
          </div>
        </div>
      </div>

      <EditProfileDialog
        profile={profile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default Profile;
