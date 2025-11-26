// DifficultySelector Component
// Allows users to switch between explanation levels

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Brain, Microscope } from "lucide-react";

export type DifficultyLevel = "simple" | "intermediate" | "advanced";

interface DifficultySelectorProps {
    currentLevel: DifficultyLevel;
    onLevelChange: (level: DifficultyLevel) => void;
    simpleContent: React.ReactNode;
    intermediateContent: React.ReactNode;
    advancedContent: React.ReactNode;
    className?: string;
}

const difficultyConfig = {
    simple: {
        label: "Simple",
        icon: GraduationCap,
        description: "Para todos los públicos",
        color: "text-green-600",
    },
    intermediate: {
        label: "Intermedio",
        icon: Brain,
        description: "Conocimientos universitarios",
        color: "text-orange-600",
    },
    advanced: {
        label: "Avanzado",
        icon: Microscope,
        description: "Nivel de investigación",
        color: "text-red-600",
    },
};

export const DifficultySelector = ({
    currentLevel,
    onLevelChange,
    simpleContent,
    intermediateContent,
    advancedContent,
    className = "",
}: DifficultySelectorProps) => {
    return (
        <div className={className}>
            <Tabs value={currentLevel} onValueChange={(v) => onLevelChange(v as DifficultyLevel)}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">¿Qué es este problema?</h2>
                    <TabsList className="grid grid-cols-3 w-full max-w-2xl">
                        {(Object.keys(difficultyConfig) as DifficultyLevel[]).map((level) => {
                            const config = difficultyConfig[level];
                            const Icon = config.icon;
                            return (
                                <TabsTrigger key={level} value={level} className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                    <span>{config.label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                <TabsContent value="simple" className="mt-0">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <GraduationCap className="w-6 h-6 text-green-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Explicación Simple</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {difficultyConfig.simple.description}
                                    </p>
                                </div>
                            </div>
                            <div className="prose prose-lg max-w-none">{simpleContent}</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="intermediate" className="mt-0">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Brain className="w-6 h-6 text-orange-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Explicación Intermedia</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {difficultyConfig.intermediate.description}
                                    </p>
                                </div>
                            </div>
                            <div className="prose prose-lg max-w-none">{intermediateContent}</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced" className="mt-0">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Microscope className="w-6 h-6 text-red-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Explicación Avanzada</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {difficultyConfig.advanced.description}
                                    </p>
                                </div>
                            </div>
                            <div className="prose prose-lg max-w-none">{advancedContent}</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
