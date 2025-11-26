import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export const EmailVerification = () => {
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [isResending, setIsResending] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        checkVerificationStatus();
    }, []);

    const checkVerificationStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setIsVerified(user?.email_confirmed_at !== null);
    };

    const handleResendVerification = async () => {
        setIsResending(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.email) {
                toast({
                    title: "Error",
                    description: "No se encontró email del usuario",
                    variant: "destructive",
                });
                return;
            }

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) {
                toast({
                    title: "Error al reenviar",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Email enviado",
                    description: "Revisa tu bandeja de entrada",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo reenviar el email",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    if (isVerified === null) {
        return null; // Loading
    }

    if (isVerified) {
        return (
            <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                    Tu email está verificado
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="flex items-center justify-between">
                <span className="text-yellow-700 dark:text-yellow-400">
                    Por favor verifica tu email para acceder a todas las funciones
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="ml-4"
                >
                    <Mail className="w-4 h-4 mr-2" />
                    {isResending ? 'Enviando...' : 'Reenviar'}
                </Button>
            </AlertDescription>
        </Alert>
    );
};
