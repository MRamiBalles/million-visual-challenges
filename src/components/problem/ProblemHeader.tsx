// ProblemHeader Component
// Displays header section for each Millennium Problem

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Award, User } from "lucide-react";
import type { MillenniumProblem } from "@/types/database";

interface ProblemHeaderProps {
    problem: MillenniumProblem;
    className?: string;
}

export const ProblemHeader = ({ problem, className = "" }: ProblemHeaderProps) => {
    const isSolved = problem.status === "solved";

    return (
        <div className={`relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white ${className}`}>
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Status Badge */}
                    <div className="mb-6">
                        <Badge
                            variant={isSolved ? "default" : "secondary"}
                            className={`text-sm px-4 py-1 ${isSolved ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}
                        >
                            {isSolved ? "✓ RESUELTO" : "SIN RESOLVER"}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        {problem.title}
                    </h1>

                    {/* Subtitle */}
                    {problem.short_title && problem.short_title !== problem.title && (
                        <p className="text-2xl md:text-3xl text-purple-200 mb-8">
                            {problem.short_title}
                        </p>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {/* Field */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-200 uppercase tracking-wide">Campo</p>
                                    <p className="font-semibold">{problem.field}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Year */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-200 uppercase tracking-wide">Año</p>
                                    <p className="font-semibold">{problem.year}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Prize / Solver */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-200 uppercase tracking-wide">
                                        {isSolved ? "Resuelto por" : "Premio"}
                                    </p>
                                    <p className="font-semibold">
                                        {isSolved ? problem.solver : problem.prize}
                                    </p>
                                    {isSolved && problem.solver_year && (
                                        <p className="text-xs text-purple-200">({problem.solver_year})</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Clay Institute Paper */}
                    <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                        <p className="text-sm text-purple-200 mb-1">Paper Oficial - Clay Mathematics Institute</p>
                        <p className="font-medium">
                            {problem.clay_paper_author} ({problem.clay_paper_year})
                        </p>
                        <a
                            href={problem.clay_paper_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-300 hover:text-blue-200 underline mt-2 inline-block"
                        >
                            Ver documento oficial →
                        </a>
                    </div>
                </div>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
    );
};
