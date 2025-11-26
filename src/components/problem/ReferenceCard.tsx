// ReferenceCard Component
// Displays academic paper references with metadata

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Quote, Calendar, TrendingUp } from "lucide-react";
import type { KeyReference } from "@/types/database";

interface ReferenceCardProps {
    reference: Partial<KeyReference> & {
        title: string;
        authors: string[];
        year: number;
        url: string;
    };
    showCitations?: boolean;
    showDescription?: boolean;
}

export const ReferenceCard = ({
    reference,
    showCitations = true,
    showDescription = true
}: ReferenceCardProps) => {
    const { title, authors, year, url, citations, description } = reference;

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                            {title}
                        </CardTitle>

                        {/* Authors */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Quote className="w-4 h-4" />
                            <span>{authors.join(", ")}</span>
                        </div>

                        {/* Year */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{year}</span>
                        </div>
                    </div>

                    {/* Citations Badge */}
                    {showCitations && citations && citations > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {citations.toLocaleString()} citas
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {(showDescription && description) && (
                <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                        {description}
                    </p>
                </CardContent>
            )}

            <CardContent className="pt-0">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Paper
                </Button>
            </CardContent>
        </Card>
    );
};

interface ReferenceListProps {
    references: (Partial<KeyReference> & {
        title: string;
        authors: string[];
        year: number;
        url: string;
    })[];
    title?: string;
    className?: string;
}

export const ReferenceList = ({
    references,
    title = "Referencias Clave",
    className = ""
}: ReferenceListProps) => {
    if (!references || references.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {references.map((ref, index) => (
                    <ReferenceCard key={index} reference={ref} />
                ))}
            </div>
        </div>
    );
};
