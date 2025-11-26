// VisualizationContainer Component
// Container for interactive visualizations with loading states

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Maximize2, RotateCcw } from "lucide-react";
import { useState } from "react";

interface VisualizationContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    onReset?: () => void;
    isLoading?: boolean;
    className?: string;
    fullscreenEnabled?: boolean;
}

export const VisualizationContainer = ({
    title,
    description,
    children,
    onReset,
    isLoading = false,
    className = "",
    fullscreenEnabled = false,
}: VisualizationContainerProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreen = () => {
        // Simple fullscreen toggle (can be enhanced with Fullscreen API)
        setIsFullscreen(!isFullscreen);
    };

    return (
        <Card className={`${className} ${isFullscreen ? "fixed inset-4 z-50" : ""}`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        {description && (
                            <CardDescription className="mt-2">{description}</CardDescription>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {onReset && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onReset}
                                title="Reiniciar"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}

                        {fullscreenEnabled && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleFullscreen}
                                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <div className={isFullscreen ? "h-[calc(100vh-200px)]" : ""}>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
};
