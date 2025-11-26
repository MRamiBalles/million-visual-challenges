import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Globe, GraduationCap, Edit } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ProfileHeaderProps {
    profile: UserProfile;
    isOwnProfile: boolean;
    onEdit?: () => void;
}

export const ProfileHeader = ({ profile, isOwnProfile, onEdit }: ProfileHeaderProps) => {
    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const roleColors = {
        user: 'bg-blue-500',
        researcher: 'bg-purple-500',
        admin: 'bg-red-500',
    };

    const roleLabels = {
        user: 'Usuario',
        researcher: 'Investigador',
        admin: 'Administrador',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl">
                            {getInitials(profile.display_name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold">
                                {profile.display_name || 'Usuario Anónimo'}
                            </h1>
                            <Badge className={roleColors[profile.role]}>
                                {roleLabels[profile.role]}
                            </Badge>
                        </div>

                        {profile.username && (
                            <p className="text-muted-foreground">@{profile.username}</p>
                        )}

                        {profile.bio && (
                            <p className="text-sm">{profile.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {profile.location}
                                </div>
                            )}

                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    <Globe className="w-4 h-4" />
                                    Website
                                </a>
                            )}

                            {profile.education_level && (
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="w-4 h-4" />
                                    {profile.education_level}
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Miembro desde {formatDistanceToNow(new Date(profile.created_at), {
                                    addSuffix: true,
                                    locale: es
                                })}
                            </div>
                        </div>

                        {profile.research_interests && profile.research_interests.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {profile.research_interests.map((interest, index) => (
                                    <Badge key={index} variant="secondary">
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Button */}
                    {isOwnProfile && onEdit && (
                        <Button onClick={onEdit} variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar Perfil
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
