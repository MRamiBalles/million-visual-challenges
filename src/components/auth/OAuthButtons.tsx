import { Button } from "@/components/ui/button";
import { Chrome as Google } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const OAuthButtons = () => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        setIsLoading(provider);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                toast({
                    title: "Error de autenticación",
                    description: error.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo conectar con el proveedor",
                variant: "destructive",
            });
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="grid gap-3">
            <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading === 'google'}
                className="w-full"
            >
                <Google className="w-4 h-4 mr-2" />
                {isLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}
            </Button>

            <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading === 'github'}
                className="w-full"
            >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {isLoading === 'github' ? 'Conectando...' : 'Continuar con GitHub'}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        O continúa con email
                    </span>
                </div>
            </div>
        </div>
    );
};
