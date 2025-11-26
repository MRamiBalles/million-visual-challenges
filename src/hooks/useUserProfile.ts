import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
    id: string;
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website_url: string | null;
    twitter_handle: string | null;
    github_handle: string | null;
    created_at: string;
    updated_at: string;
}

export interface UpdateProfileData {
    display_name?: string;
    username?: string;
    bio?: string;
    website_url?: string;
    twitter_handle?: string;
    github_handle?: string;
}

export const useUserProfile = (userId?: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch user profile
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data as UserProfile;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Update profile mutation
    const updateProfile = useMutation({
        mutationFn: async (updates: UpdateProfileData) => {
            if (!userId) throw new Error('No user ID provided');

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
            toast({
                title: 'Perfil actualizado',
                description: 'Tus cambios se han guardado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error al actualizar',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Upload avatar
    const uploadAvatar = useMutation({
        mutationFn: async (file: File) => {
            if (!userId) throw new Error('No user ID provided');

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('user-uploads')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('user-uploads')
                .getPublicUrl(filePath);

            // Update profile with new avatar URL
            const { data, error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('user_id', userId)
                .select()
                .single();

            if (updateError) throw updateError;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
            toast({
                title: 'Avatar actualizado',
                description: 'Tu foto de perfil se ha actualizado',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error al subir imagen',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        profile,
        isLoading,
        error,
        updateProfile: updateProfile.mutate,
        uploadAvatar: uploadAvatar.mutate,
        isUpdating: updateProfile.isPending || uploadAvatar.isPending,
    };
};
