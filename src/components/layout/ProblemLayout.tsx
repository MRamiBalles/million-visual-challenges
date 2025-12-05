import React, { useState } from "react";
import { useProblem } from "@/hooks/useProblem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trophy, BookOpen, ExternalLink, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ProgressTracker } from "@/components/problem/ProgressTracker";
import { SocraticTutor } from "@/components/ai/SocraticTutor";

interface ProblemLayoutProps {
    slug: string;
    title?: string;
    subtitle?: string;
    visualizer?: React.ReactNode;
    children?: React.ReactNode;
}

export const ProblemLayout = ({ slug, title, subtitle, visualizer, children }: ProblemLayoutProps) => {
    const { problem, papers, userProgress, isLoading } = useProblem(slug);
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState<"simple" | "intermediate" | "advanced">("simple");

    const displayTitle = title || problem?.title || "Loading...";
    const displaySubtitle = subtitle || problem?.field || "";
    const displayStatement = problem?.short_title || "";

    const DifficultyContent = {
        simple: problem?.description_simple || "No simple description available.",
        intermediate: problem?.description_intermediate || "No intermediate description available.",
        advanced: problem?.description_advanced || "No advanced description available.",
    };

    if (isLoading) {
        return <ProblemSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navigation Bar */}
            <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" className="gap-2" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-4 h-4" /> Back to Lab
                    </Button>
                    <div className="font-mono text-sm text-muted-foreground hidden md:block">
                        {displaySubtitle.toUpperCase()}
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row gap-6 justify-between items-start"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                {problem && (
                                    <>
                                        <Badge variant={problem.status === 'solved' ? 'default' : 'secondary'} className="text-sm">
                                            {problem.status === 'solved' ? 'SOLVED' : 'UNSOLVED'}
                                        </Badge>
                                        <div className="flex items-center text-yellow-500 gap-1 text-sm font-medium">
                                            <Trophy className="w-4 h-4" />
                                            {problem.prize}
                                        </div>
                                    </>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                                {displayTitle}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">
                                {displayStatement}
                            </p>
                        </div>

                        {problem && (
                            <div className="w-full md:w-72">
                                <ProgressTracker problemId={problem.id} initialProgress={userProgress} />
                            </div>
                        )}
                    </motion.div>
                </header>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Visualization & Explanation (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Only show Difficulty Tabs if it's a real problem page */}
                        {problem && !visualizer && !children && (
                            <Tabs
                                defaultValue="simple"
                                value={difficulty}
                                onValueChange={(v) => setDifficulty(v as "simple" | "intermediate" | "advanced")}
                                className="w-full h-full"
                            >
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="simple">Simple</TabsTrigger>
                                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                </TabsList>

                                <Card className="min-h-[200px] p-6 mb-8 border-primary/20 bg-gradient-to-b from-card to-background">
                                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                                        {DifficultyContent[difficulty]}
                                    </div>
                                </Card>
                            </Tabs>
                        )}

                        {/* Dynamic Visualizer Slot */}
                        {visualizer && (
                            <div className="rounded-xl overflow-hidden border border-border bg-black/50 shadow-2xl relative min-h-[500px]">
                                {visualizer}
                            </div>
                        )}

                        {/* Children Content (for Custom pages like Market) */}
                        {children}
                    </div>

                    {/* Right Column: Resources & Community (1/3 width) */}
                    <div className="space-y-6">
                        {/* Related Papers - Only for real problems */}
                        {papers && papers.length > 0 && (
                            <Card className="p-0 overflow-hidden">
                                <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold">Research Papers</h3>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    <div className="p-4 space-y-4">
                                        {papers.map(paper => (
                                            <a
                                                key={paper.id}
                                                href={paper.pdf_url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block group"
                                            >
                                                <div className="p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                                                    <h4 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                                                        {paper.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                            {paper.year || 'N/A'}
                                                        </span>
                                                        <span>{paper.authors?.[0] || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-3 border-t border-border bg-muted/30 text-center">
                                    <Button variant="link" size="sm" className="text-muted-foreground">View all papers</Button>
                                </div>
                            </Card>
                        )}

                        {/* Clay Institute Link - Only for real problems */}
                        {problem && (
                            <Card className="p-6 bg-blue-950/20 border-blue-900/50">
                                <h3 className="font-semibold mb-2">Original Problem Statement</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Read the official description by the Clay Mathematics Institute.
                                </p>
                                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(problem.clay_paper_url, '_blank')}>
                                    <FileText className="w-4 h-4" /> Official PDF
                                    <ExternalLink className="w-3 h-3 ml-auto" />
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            <SocraticTutor problemContext={displayTitle} />
        </div>
    );
};

const ProblemSkeleton = () => (
    <div className="min-h-screen bg-background container px-4 py-8">
        <div className="h-16 w-full mb-12 flex items-center"><Skeleton className="h-8 w-32" /></div>
        <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="grid lg:grid-cols-3 gap-8 mt-12">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    </div>
);
