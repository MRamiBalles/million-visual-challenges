import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Globe, Lock } from "lucide-react";
import { UserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";

interface EditProfileDialogProps {
    profile: UserProfile;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ profile, open, onOpenChange }: EditProfileDialogProps) => {
    const { user } = useAuth();
    const { updateProfile, uploadAvatar, isUpdating } = useUserProfile(user?.id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        location: profile.location || '',
        education_level: profile.education_level || '',
        is_public: profile.is_public || false,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Upload avatar first if changed
        if (avatarFile) {
            uploadAvatar(avatarFile);
        }

        // Update profile data
        updateProfile(formData);

        onOpenChange(false);
    };

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Actualiza tu información personal
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={avatarPreview || profile.avatar_url || undefined} />
                                <AvatarFallback className="text-2xl">
                                    {getInitials(formData.display_name)}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 rounded-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="w-4 h-4" />
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Haz clic en el ícono para cambiar tu foto
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label htmlFor="display_name">Nombre para mostrar *</Label>
                            <Input
                                id="display_name"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                required
                                placeholder="Tu nombre completo"
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username">Nombre de usuario</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="usuario_unico"
                            />
                            <p className="text-xs text-muted-foreground">
                                Debe ser único. Solo letras, números y guiones bajos.
                            </p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Biografía</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Cuéntanos sobre ti..."
                                rows={3}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {formData.bio.length}/500
                            </p>
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label htmlFor="website_url">Sitio web</Label>
                            <Input
                                id="website_url"
                                type="url"
                                value={formData.website_url}
                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                placeholder="https://tuwebsite.com"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ciudad, País"
                            />
                        </div>

                        {/* Education Level */}
                        <div className="space-y-2">
                            <Label htmlFor="education_level">Nivel educativo</Label>
                            <Input
                                id="education_level"
                                value={formData.education_level}
                                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                                placeholder="Ej: Licenciatura en Matemáticas"
                            />
                        </div>

                        {/* Profile Visibility */}
                        <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {formData.is_public ? (
                                        <Globe className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <Label htmlFor="is_public" className="text-base font-medium">
                                            Perfil público
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {formData.is_public 
                                                ? "Otros usuarios pueden ver tu perfil" 
                                                : "Solo tú puedes ver tu perfil"}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="is_public"
                                    checked={formData.is_public}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUpdating}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
